"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import DocumentViewer from "@/components/ui/document-viewer";
import { UserVideosModal } from "../../../../components/UserVideosModal";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
}

interface Document {
  id: string;
  type: string;
  filename: string;
  url: string;
  fileSize: number;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  username: string;
  phone: string | null;
  enrollments: Array<{
    id: string;
    status: string;
    plan: Plan;
    startDate: string;
    endDate: string;
  }>;
}

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState<{
    enrollmentId: string
    planId: string
    planName?: string
  } | null>(null);
  const [dietFile, setDietFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [routineFile, setRoutineFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUser();
    fetchPlans();
  }, [userId]);

  useEffect(() => {
    if (user?.enrollments[0]?.id) {
      fetchDocuments();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({
          name: data.name,
          email: data.email || "",
          username: data.username,
          password: "",
          phone: data.phone || "",
        });
      } else {
        setError("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Error al cargar usuario");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!user?.enrollments[0]?.id) return;
    
    try {
      const res = await fetch(`/api/admin/documents?enrollmentId=${user.enrollments[0].id}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`/api/admin/plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data || []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleChangePlan = async (enrollmentId: string, planId: string) => {
    // Open modal to confirm; store pending values
    const planName = plans.find((p) => p.id === planId)?.name;
    setPendingEnrollment({ enrollmentId, planId, planName });
    setConfirmOpen(true);
  };

  const onConfirmChangePlan = async () => {
    if (!pendingEnrollment) return;
    const { enrollmentId, planId } = pendingEnrollment;
    setConfirmOpen(false);
    setChangingPlanId(enrollmentId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (res.ok) {
        setSuccess("Plan actualizado exitosamente");
        await fetchUser();
        await fetchDocuments();
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar plan");
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      setError("Error al actualizar plan");
    } finally {
      setChangingPlanId(null);
      setPendingEnrollment(null);
    }
  };

  const handleUploadDocuments = async () => {
    if (!user?.enrollments[0]?.id || (!dietFile && !routineFile && !reportFile)) return;

    try {
      console.log('[UPLOAD] Preparing to upload files', {
        enrollmentId: user.enrollments[0].id,
        diet: dietFile?.name,
        routine: routineFile?.name,
        report: reportFile?.name,
      });
      const formDataFiles = new FormData();
      formDataFiles.append("enrollmentId", user.enrollments[0].id);
      
      if (dietFile) {
        formDataFiles.append("dietFile", dietFile);
      }
      if (routineFile) {
        formDataFiles.append("routineFile", routineFile);
      }
      if (reportFile) {
        formDataFiles.append("reportFile", reportFile);
      }

      const uploadResponse = await fetch("/api/admin/documents", {
        method: "POST",
        body: formDataFiles,
      });

      if (uploadResponse.ok) {
        setDietFile(null);
        setReportFile(null);
        setRoutineFile(null);
        fetchDocuments();
        setSuccess("Documentos subidos exitosamente");
      } else {
        setError("Error al subir documentos");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      setError("Error al subir documentos");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return;

    try {
      const res = await fetch(`/api/admin/documents?documentId=${documentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDocuments();
        setSuccess("Documento eliminado exitosamente");
      } else {
        setError("Error al eliminar documento");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setError("Error al eliminar documento");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUser();
  };

  // Extracted save logic so it can be called from a global button
  const saveUser = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Usuario actualizado exitosamente");
        setTimeout(() => router.push("/admin"), 1500);
      } else {
        setError(data.error || "Error al actualizar usuario");
      }
    } catch (error) {
      setError("Error al actualizar usuario");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      setError("Error al eliminar usuario");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          Usuario no encontrado
        </div>
        <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Volver
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Editar Usuario
            </h1>
            <p className="text-gray-600">
              {user.name} • {user.username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => saveUser()}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Eliminar Usuario
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="password"
              placeholder="Dejar vacío para mantener la actual"
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <div />
        </div>
      </form>

      {/* Sección de documentos */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Documentos (Dietas y Rutinas)
        </h2>

        {user.enrollments.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            ⚠️ Este usuario no tiene un plan asignado. Asigna un plan para poder subir documentos.
          </div>
        ) : (
          <>
            {/* Documentos existentes */}
            {documents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Archivos Subidos
                </h3>
                <button
                  onClick={() => setShowVideosModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm0 4H4v2h1v-2z" clipRule="evenodd" />
                  </svg>
                  Ver Videos del Usuario
                </button>
              </div>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                      <div className="flex items-center gap-3">
                        {doc.type === "REPORT" ? (
                          <div className="w-16 h-12 rounded overflow-hidden bg-white border">
                            <img src={doc.url} alt={doc.filename} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-2xl">{doc.type === "DIET" ? "🥗" : "💪"}</span>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{doc.filename}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type === "DIET" ? "Dieta" : doc.type === "ROUTINE" ? "Rutina" : "Informe"} • {((doc.fileSize || 0) / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subir nuevos documentos */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Subir Nuevos Archivos
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF de Dieta
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setDietFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {dietFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {dietFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF de Rutina
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setRoutineFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {routineFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {routineFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informe (imagen)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500"
                />
                {reportFile && (
                  <p className="mt-2 text-sm text-green-600">✓ {reportFile.name}</p>
                )}
              </div>
            </div>

            {(dietFile || routineFile || reportFile) && (
              <button
                type="button"
                onClick={handleUploadDocuments}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Subir Documentos
              </button>
            )}
          </div>
          </>
        )}
      </div>

      {user.enrollments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Planes Asociados
          </h2>
          <ul className="space-y-4">
            {user.enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    <label className="sr-only">Plan</label>
                    <select
                      value={enrollment.plan.id}
                      onChange={(e) => handleChangePlan(enrollment.id, e.target.value)}
                      disabled={changingPlanId === enrollment.id}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {plans.length === 0 ? (
                        <option value={enrollment.plan.id}>{enrollment.plan.name}</option>
                      ) : (
                        plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))
                      )}
                    </select>
                  </p>
                  <p className="text-sm text-gray-600">
                    Inicio: {new Date(enrollment.startDate).toLocaleDateString()} •
                    Fin: {new Date(enrollment.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-full ${
                    enrollment.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : enrollment.status === "EXPIRING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {enrollment.status === "ACTIVE"
                    ? "Activo"
                    : enrollment.status === "EXPIRING"
                    ? "Por vencer"
                    : "Vencido"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar cambio de plan"
        description={
          pendingEnrollment
            ? `Vas a cambiar el plan a: ${pendingEnrollment.planName || ""}. ¿Deseas continuar?`
            : undefined
        }
        confirmLabel="Sí, cambiar"
        cancelLabel="Cancelar"
        onConfirm={onConfirmChangePlan}
      />
      <DocumentViewer
        open={!!viewingDoc}
        onOpenChange={(open) => { if (!open) setViewingDoc(null); }}
        url={viewingDoc?.url}
        type={viewingDoc?.type}
        filename={viewingDoc?.filename}
      />
      <UserVideosModal
        open={showVideosModal}
        onOpenChange={setShowVideosModal}
        userId={userId}
        userName={user?.name}
      />
    </div>
  );
}
