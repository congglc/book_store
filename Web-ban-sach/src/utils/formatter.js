export const formatter = (number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number)
}

export const formatPrice = (price) => {
  if (!price && price !== 0) return "0đ"
  return `${price.toLocaleString()}đ`
}

