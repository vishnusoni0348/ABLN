import { Colors } from "@/constants/theme";
import QRCode from "qrcode";
import { useMemo } from "react";
import { View } from "react-native";

// Renders `value` as a QR code using plain Views (horizontal runs per row), with high error
// correction so a centre logo can overlay it.
export function QrCode({ value, size, color = Colors.navy }: { value: string; size: number; color?: string }) {
  const { count, runs } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: "H" });
    const n = qr.modules.size;
    const out: { row: number; start: number; len: number }[] = [];
    for (let r = 0; r < n; r++) {
      let c = 0;
      while (c < n) {
        if (!qr.modules.data[r * n + c]) {
          c++;
          continue;
        }
        const start = c;
        while (c < n && qr.modules.data[r * n + c]) c++;
        out.push({ row: r, start, len: c - start });
      }
    }
    return { count: n, runs: out };
  }, [value]);
  const cell = size / count;

  return (
    <View style={{ width: size, height: size }} accessibilityLabel="QR code">
      {runs.map((r) => (
        <View
          key={`${r.row}-${r.start}`}
          style={{ position: "absolute", left: r.start * cell, top: r.row * cell, width: r.len * cell, height: cell + 0.5, backgroundColor: color }}
        />
      ))}
    </View>
  );
}
