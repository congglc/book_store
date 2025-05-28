const { MongoClient, ObjectId } = require("mongodb")
require("dotenv").config()

async function cleanDuplicateCategories() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ayabook"
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log("Kết nối MongoDB thành công!")
    
    const db = client.db()
    const categoriesCollection = db.collection("categories")
    
    // Lấy tất cả danh mục
    const categories = await categoriesCollection.find().toArray()
    
    // Nhóm danh mục theo tên
    const categoryGroups = {}
    categories.forEach(cat => {
      if (!categoryGroups[cat.name]) {
        categoryGroups[cat.name] = []
      }
      categoryGroups[cat.name].push(cat)
    })
    
    // Xử lý từng nhóm danh mục
    for (const [name, cats] of Object.entries(categoryGroups)) {
      if (cats.length > 1) {
        console.log(`Tìm thấy ${cats.length} danh mục trùng lặp với tên "${name}"`)
        
        // Giữ lại danh mục đầu tiên
        const keepCategory = cats[0]
        const keepCategoryId = keepCategory._id
        
        // Xóa các danh mục còn lại
        for (let i = 1; i < cats.length; i++) {
          const deleteCategory = cats[i]
          console.log(`Xóa danh mục trùng lặp: ${deleteCategory._id}`)
          
          // Cập nhật sách từ danh mục bị xóa sang danh mục giữ lại
          await db.collection("books").updateMany(
            { category: deleteCategory._id },
            { $set: { category: keepCategoryId } }
          )
          
          // Xóa danh mục
          await categoriesCollection.deleteOne({ _id: deleteCategory._id })
        }
      }
    }
    
    console.log("Hoàn thành xóa danh mục trùng lặp!")
  } catch (error) {
    console.error("Lỗi:", error)
  } finally {
    await client.close()
  }
}

cleanDuplicateCategories()