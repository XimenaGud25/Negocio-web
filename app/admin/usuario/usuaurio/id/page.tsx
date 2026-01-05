export default function UsuarioDetalle() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">

      <h1 className="text-2xl font-extrabold">
        Perfil del usuario
      </h1>

      {/* INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold mb-4">Información general</h2>
        <p>Nombre: —</p>
        <p>Email: —</p>
        <p>Estado: —</p>
      </div>

      {/* PLAN */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold mb-4">Plan actual</h2>
        <p>Plan: —</p>
        <p>Fecha inicio: —</p>
        <p>Fecha fin: —</p>
      </div>

      {/* ACCIONES */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold mb-4">Acciones</h2>
        <div className="flex gap-4">
          <button className="bg-yellow-400 px-6 py-2 rounded font-bold">
            Asignar plan
          </button>
          <button className="bg-black text-white px-6 py-2 rounded">
            Subir archivos
          </button>
        </div>
      </div>

    </section>
  );
}
