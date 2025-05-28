// API URL
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
export const UPLOADS_URL = "http://localhost:5001/uploads/";

// Hàm xử lý URL ảnh an toàn
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg?height=300&width=200";
  
  // Đảm bảo imagePath là string
  const imagePathStr = String(imagePath);
  
  // Nếu đã là URL đầy đủ, trả về nguyên bản
  if (imagePathStr.startsWith('http://') || imagePathStr.startsWith('https://')) {
    return imagePathStr;
  }
  
  // Nếu bắt đầu bằng "image-", đây là tên file được lưu trực tiếp
  return `${UPLOADS_URL}${imagePathStr}`;
};

// Hàm định dạng giá tiền
export const formatPrice = (price) => {
  if (!price && price !== 0) return "0đ";
  return price.toLocaleString('vi-VN') + 'đ';
};

// Hàm kiểm tra xem một chuỗi có phải là URL không
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Hàm kiểm tra xem một chuỗi có chứa một chuỗi con không (thay thế cho includes)
export const stringContains = (str, searchStr) => {
  if (!str || typeof str !== 'string') return false;
  return str.indexOf(searchStr) !== -1;
};










