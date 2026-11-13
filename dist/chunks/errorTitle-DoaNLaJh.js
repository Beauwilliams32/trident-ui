//#region src/forms/errorTitle.ts
var isEmpty = (m) => m === void 0 || m === null || m === false || m === "";
/** How many errors ErrorSummary would list for `errors` (empty messages are skipped, as there). */
function errorCount(errors) {
	if (errors === null || errors === void 0) return 0;
	if (typeof errors === "number") return Number.isFinite(errors) && errors > 0 ? Math.floor(errors) : 0;
	return (Array.isArray(errors) ? errors.map((e) => e.message) : Object.values(errors)).filter((m) => !isEmpty(m)).length;
}
/**
* The page `<title>` after a failed form POST (GOV.UK error summary pattern): "Error: <title>" when
* there is at least one error, so screen-reader users hear the failure as soon as the page loads.
* With no errors the title comes back unchanged. Pass the same `errors` you give ErrorSummary.
*
*   <title>{errorTitle('Your profile | Trident NIL', errors)}</title>
*/
function errorTitle(title, errors, prefix = "Error") {
	return errorCount(errors) > 0 ? `${prefix}: ${title}` : title;
}
//#endregion
export { errorTitle as n, errorCount as t };
