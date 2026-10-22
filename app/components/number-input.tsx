"use client";

import { useState, type ComponentProps } from "react";

/**
 * 入力中の文字列をそのまま保持する数値入力欄。
 * 空欄は 0 として扱い、外から value が変わったときだけ表示を書き換える。
 */
export default function NumberInput({
  value,
  onChange,
  parse,
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  parse: (text: string) => number;
} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (parse(text) !== value) setText(String(value));
  }

  return (
    <input
      {...props}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parse(e.target.value));
      }}
    />
  );
}
