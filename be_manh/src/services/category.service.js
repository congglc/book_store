const CategoryModel = require('../models/category.model')
const BookModel = require("../models/book.model")
const { ObjectId } = require("mongodb")

const CategoryService = {
  async getAllCategories() {
    const categories = await CategoryModel.getAll()
    
    // Thêm số lượng sách cho mỗi danh mục
    const categoriesWithBookCount = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await BookModel.countByCategory(category._id)
        return {
          ...category,
          bookCount
        }
      })
    )
    
    return categoriesWithBookCount
  },

  async getCategoryById(id) {
    let category = null
    if (ObjectId.isValid(id)) {
      category = await CategoryModel.findById(id)
    } else {
      category = await CategoryModel.findByName(id)
    }
    if (!category) {
      throw new Error("Category not found")
    }
    return category
  },

  async createCategory(categoryData) {
    // Check if category already exists
    const existingCategory = await CategoryModel.findByName(categoryData.name)
    if (existingCategory) {
      throw new Error("Category already exists with this name")
    }
    return CategoryModel.create(categoryData)
  },

  async updateCategory(id, updateData) {
    // Check if category exists
    const category = await CategoryModel.findById(id)
    if (!category) {
      throw new Error("Category not found")
    }
    // Check if name is being updated and if it already exists
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await CategoryModel.findByName(updateData.name)
      if (existingCategory) {
        throw new Error("Category already exists with this name")
      }
    }
    return CategoryModel.update(id, updateData)
  },

  async deleteCategory(id) {
    // Check if category exists
    const category = await CategoryModel.findById(id)
    if (!category) {
      throw new Error("Category not found")
    }
    // Check if category is being used by any books
    // (nếu cần, có thể kiểm tra bằng BookModel.getAll({category: id}))
    return CategoryModel.delete(id)
  },
}

module.exports = CategoryService
