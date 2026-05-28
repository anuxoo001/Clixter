import { BsMessenger } from "react-icons/bs"; // Install with `react-icons` if not done

export default function StartChat() {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full text-center px-4">
      <div className="rounded-full border-2 border-black p-4 mb-4">
        <BsMessenger className="text-black text-4xl" />
      </div>
      <h2 className="text-xl font-semibold mb-1">Your messages</h2>
      <p className="text-gray-400 text-sm mb-4">
        Send private photos and messages to a friend or group.
      </p>
      <button className="bg-[#3D8BFF] text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
        Send message
      </button>
    </div>
  );
}
