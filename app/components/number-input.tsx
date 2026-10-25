"use client";

import { useState, type ComponentProps } from "react";

/**
 * 入力中の文字列をそのまま保持する数値入力欄。
 * 空欄は 0 として扱い、外から value が変わったときだけ表示を書き換える。
 * `blankZero` を指定すると、値が 0 のときは空欄で表示する。
 */
export default function NumberInput({
  value,
  onChange,
  parse,
  blankZero = false,
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  parse: (text: string) => number;
  blankZero?: boolean;
} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const format = (v: number) => (blankZero && v === 0 ? "" : String(v));
  const [text, setText] = useState(format(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (parse(text) !== value) setText(format(value));
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
