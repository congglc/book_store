const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")

const BookModel = {
  async findById(id) {
    const db = getDb()
    if (!ObjectId.isValid(id)) return null;
    return db.collection("books").findOne({ _id: new ObjectId(id) })
  },

  async create(bookData) {
    const db = getDb()

    // Add timestamps
    bookData.createdAt = new Date()
    bookData.updatedAt = new Date()

    // Convert category to ObjectId if it's a string and valid ObjectId
    if (bookData.category) {
      try {
        if (typeof bookData.category === "string" && bookData.category.length === 24) {
          bookData.category = new ObjectId(bookData.category)
        }
      } catch (error) {
        console.error("Error converting category to ObjectId:", error)
        // Nếu không thể chuyển đổi, giữ nguyên giá trị
      }
    }
    
    // Đảm bảo trường image là string
    if (bookData.image && typeof bookData.image !== "string") {
      if (bookData.image.filename) {
        bookData.image = bookData.image.filename
      } else if (bookData.image.path) {
        bookData.image = bookData.image.path.split('/').pop()
      }
    }

    const result = await db.collection("books").insertOne(bookData)
    return this.findById(result.insertedId)
  },

  async update(id, updateData) {
    const db = getDb()
    
    // Đảm bảo trường image là string
    if (updateData.image && typeof updateData.image !== "string") {
      if (updateData.image.filename) {
        updateData.image = updateData.image.filename
      } else if (updateData.image.path) {
        updateData.image = updateData.image.path.split('/').pop()
      }
    }
    
    // Update timestamp
    updateData.updatedAt = new Date()

    // Convert category to ObjectId if it's a string and valid ObjectId
    if (updateData.category) {
      try {
        if (typeof updateData.category === "string" && updateData.category.length === 24) {
          updateData.category = new ObjectId(updateData.category)
        }
      } catch (error) {
        console.error("Error converting category to ObjectId:", error)
      }
    }

    await db.collection("books").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return this.findById(id)
  },

  // Cải thiện phương thức getAll để hỗ trợ phân trang tốt hơn
  async getAll(query = {}, options = {}) {
    const db = getDb()
    const skip = parseInt(options.skip) || 0
    const limit = parseInt(options.limit) || 20
    const sort = options.sort || { createdAt: -1 }

    // Handle text search
    if (query.search) {
      query.$text = { $search: query.search }
      delete query.search
    }

    // Handle category filter
    if (query.category) {
      if (typeof query.category === "string" && ObjectId.isValid(query.category)) {
        query.category = new ObjectId(query.category)
      }
    }

    // Handle price range
    if (query.minPrice || query.maxPrice) {
      query.price = {}
      if (query.minPrice) {
        query.price.$gte = Number.parseFloat(query.minPrice)
        delete query.minPrice
      }
      if (query.maxPrice) {
        query.price.$lte = Number.parseFloat(query.maxPrice)
        delete query.maxPrice
      }
    }

    // Đếm tổng số sách thỏa mãn điều kiện
    const total = await db.collection("books").countDocuments(query)

    // Lấy danh sách sách với phân trang
    const books = await db.collection("books").find(query).sort(sort).skip(skip).limit(limit).toArray()

    // Trả về kết quả với thông tin phân trang
    return {
      books,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  async delete(id) {
    const db = getDb()
    return db.collection("books").deleteOne({ _id: new ObjectId(id) })
  },

  async getBestsellers(limit = 10) {
    const db = getDb()
    const parsedLimit = parseInt(limit) || 10
    const books = await db.collection("books").find({ isBestseller: true }).sort({ soldCount: -1 }).limit(parsedLimit).toArray()
    return {
      books,
      total: books.length,
      limit: parsedLimit
    }
  },

  async getNewArrivals(limit = 10) {
    const db = getDb()
    const parsedLimit = parseInt(limit) || 10
    const books = await db.collection("books").find().sort({ createdAt: -1 }).limit(parsedLimit).toArray()
    return {
      books,
      total: books.length,
      limit: parsedLimit
    }
  },

  async updateStock(id, quantity) {
    const db = getDb()
    return db.collection("books").updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: {
          stock: -quantity,
          soldCount: quantity,
        },
        $set: { updatedAt: new Date() },
      },
    )
  },

  async searchBooks(params = {}) {
    const db = getDb()
    const {
      name = "",
      category = "",
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
    } = params

    const query = {}

    // Tìm kiếm theo tên (title)
    if (name && name.trim() !== "") {
      query.title = { $regex: name, $options: "i" }
    }

    // Tìm kiếm theo danh mục
    if (category && category.trim() !== "") {
      try {
        if (ObjectId.isValid(category)) {
          query.category = new ObjectId(category)
        } else {
          // Tìm category theo tên
          const cat = await db.collection("categories").findOne({ name: category })
          if (cat) query.category = cat._id
          else query.category = null // Không tìm thấy thì không trả về gì
        }
      } catch (error) {
        console.error("Lỗi khi xử lý ID danh mục:", error)
      }
    }

    // Tìm kiếm theo khoảng giá
    if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
      query.price = {}

      if (minPrice > 0) {
        query.price.$gte = Number(minPrice)
      }

      if (maxPrice < Number.MAX_SAFE_INTEGER) {
        query.price.$lte = Number(maxPrice)
      }
    }

    // Tính toán skip cho phân trang
    const skip = (Number(page) - 1) * Number(limit)

    // Đếm tổng số kết quả
    const total = await db.collection("books").countDocuments(query)

    // Lấy dữ liệu với phân trang và sắp xếp
    const books = await db.collection("books").find(query).sort(sort).skip(skip).limit(Number(limit)).toArray()

    return {
      books,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    }
  },

  async countByCategory(categoryId) {
    const db = getDb()
    const query = { category: new ObjectId(categoryId) }
    return db.collection("books").countDocuments(query)
  },
}

module.exports = BookModel
