
const suggestions = ["hp panigrahi", "Suchi💞", "Barsha🇮🇳"];

export default function Suggestions() {
  return (
    <div className="text-slate-100">
      <h3 className="text-lg font-semibold mb-2">Suggestions for you</h3>


      <div className="flex gap-4 overflow-x-auto">
        {suggestions.map((name, i) => (
          <div key={i} className="flex flex-col items-center w-24 text-center">
            <div className="w-16 h-16 bg-gray-500 rounded-full" />
            <span className="text-sm mt-1">{name}</span>
            <button className="text-blue-400 text-sm mt-1">Follow</button>
          </div>
        ))}
      </div>
    </div>
  );
}
