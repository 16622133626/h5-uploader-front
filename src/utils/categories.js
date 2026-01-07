// 分类数据结构
export const categories = [
  {
    "group": "婚纱礼服",
    "options": [
      { "value": "main_gown", "label": "主纱" },
      { "value": "xiuhe", "label": "秀禾服" },
      { "value": "cocktail_dress", "label": "礼服" }
    ]
  },
  {
    "group": "新娘造型服务",
    "options": [
      { "value": "makeup", "label": "新娘跟妆" },
      { "value": "nail", "label": "美甲服务" }
    ]
  }
]

// 获取所有分类选项（扁平化）
export function getAllCategoryOptions() {
  return categories.flatMap(group => group.options)
}

// 根据value获取label
export function getCategoryLabel(value) {
  const allOptions = getAllCategoryOptions()
  const option = allOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

// 根据value获取group
export function getCategoryGroup(value) {
  for (const group of categories) {
    if (group.options.some(opt => opt.value === value)) {
      return group.group
    }
  }
  return ''
}


