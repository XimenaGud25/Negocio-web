import React from "react";

type WgerResult = {
  id: number;
  name: string;
  description: string;
};

async function getExercises(): Promise<WgerResult[]> {
  const res = await fetch("https://wger.de/api/v2/exercise/?language=2&limit=20", { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch exercises");
  const data = await res.json();
  return data.results as WgerResult[];
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default async function ExercisesPage() {
  let exercises: WgerResult[] = [];
  try {
    exercises = await getExercises();
  } catch (err) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-black text-white">
        <div className="max-w-xl w-full text-center bg-[#0f0f0f] rounded-lg p-6">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Ejercicios</h1>
          <p className="text-sm text-red-400">No se pudo cargar la lista de ejercicios. Intenta de nuevo más tarde.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-lg p-6">
        <h1 className="text-2xl font-extrabold mb-4 text-yellow-400">Ejercicios (wger)</h1>
        <ul className="grid gap-4">
          {exercises.map((ex) => (
            <li key={ex.id} className="p-4 bg-black rounded-md border border-gray-800">
              <h2 className="font-semibold">{ex.name}</h2>
              {ex.description ? (
                <p className="text-sm text-gray-300 mt-2">{stripHtml(ex.description).slice(0, 200)}{stripHtml(ex.description).length > 200 ? "..." : ""}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Sin descripción</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
