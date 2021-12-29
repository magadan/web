import type { EasingFunction, TransitionConfig } from "svelte/types/runtime/transition";
import { cubicOut } from "svelte/easing";

export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: "x" | "y";
}

export function slide(
	node: Element,
	{ delay = 0, duration = 400, easing = cubicOut, axis = "y" }: SlideParams = {}
): TransitionConfig {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const primary_dimension = axis === "y" ? "height" : "width";
	const primary_dimension_value = parseFloat(style[primary_dimension]);
	const secondary_dimensions = axis === "y" ? ["Top", "Bottom"] : ["Left", "Right"];
	const padding_start_value = parseFloat(style.padding + secondary_dimensions[0]);
	const padding_end_value = parseFloat(style.padding + secondary_dimensions[1]);
	const margin_start_value = parseFloat(style.margin + secondary_dimensions[0]);
	const margin_end_value = parseFloat(style.margin + secondary_dimensions[1]);
	const border_width_start_value = parseFloat(style[`border${secondary_dimensions[0]}Width`]);
	const border_width_end_value = parseFloat(style[`border${secondary_dimensions[1]}Width`]);
	return {
		delay,
		duration,
		easing,
		css: (t) =>
			"overflow: hidden;" +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`${primary_dimension}: ${t * primary_dimension_value}px;` +
			`padding-${secondary_dimensions[0].toLowerCase()}: ${t * padding_start_value}px;` +
			`padding-${secondary_dimensions[1].toLowerCase()}: ${t * padding_end_value}px;` +
			`margin-${secondary_dimensions[0].toLowerCase()}: ${t * margin_start_value}px;` +
			`margin-${secondary_dimensions[1].toLowerCase()}: ${t * margin_end_value}px;` +
			`border-${secondary_dimensions[0].toLowerCase()}-width: ${t * border_width_start_value}px;` +
			`border-${secondary_dimensions[1].toLowerCase()}-width: ${t * border_width_end_value}px;`,
	};
}
