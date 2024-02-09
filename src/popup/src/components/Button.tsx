import { ComponentProps } from "react";

export default function Button(props: ComponentProps<"button">) {
  return (
    <div className="block w-full my-1">
      <button
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full"
        {...props}
      />
    </div>
  );
}
