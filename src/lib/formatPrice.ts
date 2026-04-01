export function formatPrice(price: number | string) {
  const numberPrice =
    typeof price === "number"
      ? price
      : parseInt(String(price).replace(/[^0-9]/g, "")) || 0;

  return numberPrice.toLocaleString("ru-RU") + " сум";
}