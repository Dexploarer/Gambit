/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _helpers from "../_helpers.js";
import type * as _runtimeCore from "../_runtimeCore.js";
import type * as _validators from "../_validators.js";
import type * as cards from "../cards.js";
import type * as effects from "../effects.js";
import type * as exports from "../exports.js";
import type * as imports from "../imports.js";
import type * as render from "../render.js";
import type * as runtime from "../runtime.js";
import type * as templates from "../templates.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _helpers: typeof _helpers;
  _runtimeCore: typeof _runtimeCore;
  _validators: typeof _validators;
  cards: typeof cards;
  effects: typeof effects;
  exports: typeof exports;
  imports: typeof imports;
  render: typeof render;
  runtime: typeof runtime;
  templates: typeof templates;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
