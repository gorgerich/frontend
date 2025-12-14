"use client";

import React from "react";
import { Button } from "./ui/button";

type ContractButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export default function ContractButton({
  onClick,
  disabled,
  className,
  label = "Скачать договор",
}: ContractButtonProps) {
  return (
    <Button type="button" onClick={onClick} disabled={disabled} className={className}>
      {label}
    </Button>
  );
}
