import React from "react";

type ButtonProps = {
  buttonText: string;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function Button({ buttonText, ...rest }: ButtonProps) {
  return (
    <div className="block w-full my-1">
      <button
        {...rest}
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full"
      >
        {buttonText}
      </button>
    </div>
  );
}
