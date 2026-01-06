
export interface DepthInfo {
    depth: number;
    name: string;
}

const DEPTH_TABLE: Map<number, DepthInfo> = new Map([
    [1, { depth: 1, name: "腐食" }],
    [2, { depth: 2, name: "狂乱" }],
    [3, { depth: 3, name: "混沌" }],
    [4, { depth: 4, name: "虚無" }],
    [5, { depth: 5, name: "深淵" }],
]);

export function getDepthInfo(depth: number): DepthInfo {
    const info = DEPTH_TABLE.get(depth);
    if (!info) {
        return DEPTH_TABLE.get(1)!;
    }
    return info;
}
export const depthThemes = {
    1: {
        primary: "#1a3326",
        secondary: "#2d5f3f",
        accent: "#4a9d6d",
        bg: "linear-gradient(135deg, #050a08 0%, #0a1410 100%)",
        glow: "rgba(74, 157, 109, 0.25)",
        hover: "#96fabfff",
    },
    2: {
        primary: "#1a2640",
        secondary: "#2e4a7c",
        accent: "#4a7fd9",
        bg: "linear-gradient(135deg, #030509 0%, #060e18 100%)",
        glow: "rgba(74, 127, 217, 0.25)",
        hover: "#5086e2ff",
    },
    3: {
        primary: "#401a1a",
        secondary: "#7c2e2e",
        accent: "#d94a4a",
        bg: "linear-gradient(135deg, #0a0303 0%, #180808 100%)",
        glow: "rgba(217, 74, 74, 0.25)",
        hover: "#e44e4eff",
    },
    4: {
        primary: "#2d1a40",
        secondary: "#5a2e7c",
        accent: "#9a4ad9",
        bg: "linear-gradient(135deg, #050308 0%, #0d0618 100%)",
        glow: "rgba(154, 74, 217, 0.25)",
        hover: "#a34fe3ff",
    },
    5: {
        primary: "#1a0a0f",
        secondary: "#331419",
        accent: "#8f1f3d",
        bg: "linear-gradient(135deg, #000000 0%, #0a0305 100%)",
        glow: "rgba(143, 31, 61, 0.3)",
        hover: "#bc3d5fff",
    },
};