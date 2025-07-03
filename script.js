// 烘焙成本管理系統 - 主要JavaScript檔案

// 全域變數
let currentImportType = '';
let editingItemId = null;

// 資料儲存結構
const dataStore = {
    ingredients: [],
    recipes: [],
    products: [],
    packaging: [],
    nutrition: [],
    recipeNutrition: [] // 新增配方營養成分表
};

// 系統初始化
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    initializeData();
    renderAllTables();
    showNotification('系統載入完成', 'success');
});

// 從localStorage載入資料
function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem('bakingCostManager');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            Object.assign(dataStore, parsed);
        }
    } catch (error) {
        console.error('載入資料失敗:', error);
        showNotification('載入資料失敗，將使用預設資料', 'warning');
    }
}

// 儲存資料到localStorage
function saveDataToStorage() {
    try {
        localStorage.setItem('bakingCostManager', JSON.stringify(dataStore));
    } catch (error) {
        console.error('儲存資料失敗:', error);
        showNotification('儲存資料失敗', 'error');
    }
}

// 初始化範例資料（僅在第一次使用時）
function initializeData() {
    if (dataStore.ingredients.length === 0) {
        dataStore.ingredients = [
            { id: 1, name: '麵粉', category: '粉類', unit: '公斤', price: 35 },
            { id: 2, name: '雞蛋', category: '蛋奶類', unit: '顆', price: 8 },
            { id: 3, name: '奶油', category: '油脂類', unit: '公斤', price: 180 },
            { id: 4, name: '砂糖', category: '糖類', unit: '公斤', price: 25 },
            { id: 5, name: '牛奶', category: '蛋奶類', unit: '公升', price: 65 }
        ];
    }

    if (dataStore.packaging.length === 0) {
        dataStore.packaging = [
            { id: 1, name: '蛋糕盒 6吋', category: '盒子', cost: 15, note: '白色硬紙盒' },
            { id: 2, name: '蛋糕盒 8吋', category: '盒子', cost: 25, note: '白色硬紙盒' },
            { id: 3, name: '餅乾袋', category: '袋子', cost: 2, note: '透明塑膠袋' }
        ];
    }

    if (dataStore.nutrition.length === 0) {
        dataStore.nutrition = [
            { 
                id: 1, 
                ingredient: '麵粉', 
                calories: 364, 
                protein: 10.3, 
                fat: 0.98, 
                saturatedFat: 0.2,
                transFat: 0,
                carbs: 76, 
                sugar: 0.3, 
                sodium: 2 
            },
            { 
                id: 2, 
                ingredient: '雞蛋', 
                calories: 155, 
                protein: 13, 
                fat: 11, 
                saturatedFat: 3.1,
                transFat: 0,
                carbs: 1.1, 
                sugar: 0.6, 
                sodium: 124 
            },
            { 
                id: 3, 
                ingredient: '奶油', 
                calories: 717, 
                protein: 0.85, 
                fat: 81, 
                saturatedFat: 51,
                transFat: 1.5,
                carbs: 0.06, 
                sugar: 0.06, 
                sodium: 11 
            }
        ];
    }

    saveDataToStorage();
    updateRecipeNutritionData(); // 初始化配方營養成分表
}

// 頁面切換功能
function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 移除所有導覽按鈕的active狀態
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // 顯示指定頁面
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 設定對應導覽按鈕為active
    event.target.classList.add('active');

    // 重新渲染對應的表格
    renderTable(pageId);
}

// 顯示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 生成唯一ID
function generateId(type) {
    const existing = dataStore[type];
    return existing.length > 0 ? Math.max(...existing.map(item => item.id)) + 1 : 1;
}

// 表格渲染功能
function renderAllTables() {
    renderTable('ingredients');
    renderTable('recipes');
    renderTable('products');
    renderTable('packaging');
    renderTable('nutrition');
}

function renderTable(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    if (!tbody) return;

    const data = dataStore[type];

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>暫無資料</h3>
                    <p>點擊上方按鈕開始新增${getTypeName(type)}</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(item => {
        switch(type) {
            case 'ingredients':
                return renderIngredientRow(item);
            case 'recipes':
                return renderRecipeRow(item);
            case 'products':
                return renderProductRow(item);
            case 'packaging':
                return renderPackagingRow(item);
            case 'nutrition':
                return renderNutritionRow(item);
            default:
                return '';
        }
    }).join('');
}

// 各類型資料的表格行渲染
function renderIngredientRow(item) {
    return `
        <tr>
            <td><input type="checkbox" value="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.category || ''}</td>
            <td>${item.unit}</td>
            <td>${item.price}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning" onclick="editItem('ingredients', ${item.id})">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-danger" onclick="deleteItem('ingredients', ${item.id})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderRecipeRow(item) {
    const totalCost = calculateRecipeCost(item);
    const totalWeight = item.totalWeight || calculateRecipeWeight(item);
    const costPerGram = totalWeight > 0 ? (totalCost / totalWeight).toFixed(3) : 0;
    const costPerServing = item.servings > 0 ? (totalCost / item.servings).toFixed(2) : 0;

    return `
        <tr>
            <td><input type="checkbox" value="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.category || ''}</td>
            <td>${item.servings || 1}</td>
            <td>${totalWeight}</td>
            <td>${totalCost.toFixed(2)}</td>
            <td>${costPerGram}</td>
            <td>${costPerServing}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info" onclick="viewRecipeDetails(${item.id})">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-warning" onclick="editItem('recipes', ${item.id})">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-danger" onclick="deleteItem('recipes', ${item.id})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderProductRow(item) {
    const totalCost = calculateProductCost(item);
    const sellingPrice = item.sellingPrice || 0;
    const profit = sellingPrice - totalCost;
    const profitMargin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;
    const recipeNames = item.recipes ? item.recipes.map(r => r.name).join(', ') : '';

    return `
        <tr>
            <td><input type="checkbox" value="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.category || ''}</td>
            <td>${recipeNames}</td>
            <td>${totalCost.toFixed(2)}</td>
            <td>${sellingPrice.toFixed(2)}</td>
            <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${profit.toFixed(2)} (${profitMargin}%)</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info" onclick="viewProductDetails(${item.id})">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-warning" onclick="editItem('products', ${item.id})">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-danger" onclick="deleteItem('products', ${item.id})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderPackagingRow(item) {
    return `
        <tr>
            <td><input type="checkbox" value="${item.id}"></td>
            <td>${item.name}</td>
            <td>${item.category || ''}</td>
            <td>${item.cost}</td>
            <td>${item.note || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning" onclick="editItem('packaging', ${item.id})">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-danger" onclick="deleteItem('packaging', ${item.id})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderNutritionRow(item) {
    return `
        <tr>
            <td><input type="checkbox" value="${item.id}"></td>
            <td>${item.ingredient}</td>
            <td>${item.calories}</td>
            <td>${item.protein || 0}</td>
            <td>${item.fat || 0}</td>
            <td>${item.saturatedFat || 0}</td>
            <td>${item.transFat || 0}</td>
            <td>${item.carbs || 0}</td>
            <td>${item.sugar || 0}</td>
            <td>${item.sodium || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning" onclick="editItem('nutrition', ${item.id})">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-danger" onclick="deleteItem('nutrition', ${item.id})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// 成本計算功能
function calculateRecipeCost(recipe) {
    if (!recipe.ingredients) return 0;

    return recipe.ingredients.reduce((total, recipeIngredient) => {
        const ingredient = dataStore.ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
        if (ingredient && recipeIngredient.amount > 0) {
            // 假設配方中的用量都是以公克為單位，需要根據原料單位進行換算
            let costPerGram = ingredient.price;
            if (ingredient.unit === '公斤') {
                costPerGram = ingredient.price / 1000;
            } else if (ingredient.unit === '公升') {
                costPerGram = ingredient.price / 1000; // 假設1公升≈1000公克
            } else if (ingredient.unit === '顆') {
                costPerGram = ingredient.price / 50; // 假設一顆雞蛋約50公克
            }

            return total + (costPerGram * recipeIngredient.amount);
        }
        return total;
    }, 0);
}

function calculateRecipeWeight(recipe) {
    if (!recipe.ingredients) return 0;

    return recipe.ingredients.reduce((total, recipeIngredient) => {
        if (recipeIngredient.amount > 0) {
            return total + recipeIngredient.amount;
        }
        return total;
    }, 0);
}

function calculateProductCost(product) {
    if (!product.recipes) return 0;

    let totalCost = 0;

    // 計算配方成本
    product.recipes.forEach(productRecipe => {
        const recipe = dataStore.recipes.find(r => r.id === productRecipe.recipeId);
        if (recipe) {
            const recipeCost = calculateRecipeCost(recipe);
            let itemCost = 0;

            if (productRecipe.unit === 'serving') {
                // 按份數計算
                const servings = recipe.servings || 1;
                const costPerServing = recipeCost / servings;
                itemCost = costPerServing * productRecipe.amount;
            } else {
                // 按重量計算（向下相容舊資料）
                const amount = productRecipe.amount || productRecipe.weight || 0;
                const recipeWeight = recipe.totalWeight || calculateRecipeWeight(recipe);
                const costPerGram = recipeWeight > 0 ? recipeCost / recipeWeight : 0;
                itemCost = costPerGram * amount;
            }

            totalCost += itemCost;
        }
    });

    // 加上包裝成本
    if (product.packaging && Array.isArray(product.packaging)) {
        product.packaging.forEach(packagingItem => {
            const packaging = dataStore.packaging.find(p => p.id === packagingItem.packagingId);
            if (packaging) {
                totalCost += packaging.cost * packagingItem.quantity;
            }
        });
    } else if (product.packaging) {
        // 向下相容舊格式
        const packaging = dataStore.packaging.find(p => p.id === product.packaging.packagingId);
        if (packaging) {
            totalCost += packaging.cost * product.packaging.quantity;
        }
    }

    return totalCost;
}

// 搜尋功能
function searchTable(type) {
    const searchInput = document.getElementById(`${type}-search`);
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById(`${type}-tbody`);
    const rows = tbody.getElementsByTagName('tr');

    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// 選擇功能
function selectAllItems(type, checkbox) {
    const tbody = document.getElementById(`${type}-tbody`);
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

function getSelectedItems(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// 刪除功能
function deleteItem(type, id) {
    if (confirm('確定要刪除這個項目嗎？')) {
        const index = dataStore[type].findIndex(item => item.id === id);
        if (index !== -1) {
            dataStore[type].splice(index, 1);
            saveDataToStorage();
            renderTable(type);
            showNotification('刪除成功', 'success');
        }
    }
}

function deleteSelectedItems(type) {
    const selectedIds = getSelectedItems(type);
    if (selectedIds.length === 0) {
        showNotification('請先選擇要刪除的項目', 'warning');
        return;
    }

    if (confirm(`確定要刪除選中的 ${selectedIds.length} 個項目嗎？`)) {
        dataStore[type] = dataStore[type].filter(item => !selectedIds.includes(item.id));
        saveDataToStorage();
        renderTable(type);
        showNotification(`成功刪除 ${selectedIds.length} 個項目`, 'success');
    }
}

// 彈出視窗功能
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="modal-header">
            <h3>${title}</h3>
            <span class="close" onclick="closeModal()">&times;</span>
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    editingItemId = null;
}

// 點擊彈出視窗外部關閉
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// 表單顯示功能
function showAddIngredientForm() {
    editingItemId = null;
    const formContent = `
        <h3><i class="fas fa-plus"></i> 新增原料</h3>
        <form onsubmit="saveIngredient(event)">
            <div class="form-group">
                <label for="ingredient-name">原料名稱 *</label>
                <input type="text" id="ingredient-name" required>
            </div>
            <div class="form-group">
                <label for="ingredient-category">原料分類</label>
                <input type="text" id="ingredient-category" placeholder="例：粉類、油脂類、糖類、蛋奶類">
            </div>
            <div class="form-group">
                <label for="ingredient-unit">單位 *</label>
                <select id="ingredient-unit" required>
                    <option value="">請選擇單位</option>
                    <option value="公斤">公斤</option>
                    <option value="公克">公克</option>
                    <option value="公升">公升</option>
                    <option value="毫升">毫升</option>
                    <option value="顆">顆</option>
                    <option value="包">包</option>
                </select>
            </div>
            <div class="form-group">
                <label for="ingredient-price">單價 (元) *</label>
                <input type="number" id="ingredient-price" step="0.01" min="0" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">儲存</button>
            </div>
        </form>
    `;

    showModal('新增原料', formContent);
}

function showAddRecipeForm() {
    editingItemId = null;
    const ingredientOptions = dataStore.ingredients.map(ing => 
        `<option value="${ing.id}">${ing.name} (${ing.unit})</option>`
    ).join('');

    const formContent = `
        <h3><i class="fas fa-plus"></i> 新增配方</h3>
        <form onsubmit="saveRecipe(event)">
            <div class="form-group">
                <label for="recipe-name">配方名稱 *</label>
                <input type="text" id="recipe-name" required>
            </div>
            <div class="form-group">
                <label for="recipe-category">配方分類</label>
                <input type="text" id="recipe-category" placeholder="例：蛋糕、餅乾、麵包、塔類">
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 1; margin-right: 1rem;">
                    <label for="recipe-servings">總份量 *</label>
                    <input type="number" id="recipe-servings" min="1" value="1" required onchange="updateRecipeCost()">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="recipe-total-weight">總重量 (g)</label>
                    <input type="number" id="recipe-total-weight" min="0" step="0.1" placeholder="自動計算或手動輸入" onchange="updateRecipeCost()">
                </div>
            </div>
            <div class="form-group">
                <label>配方原料</label>
                <div class="recipe-ingredients" id="recipe-ingredients">
                    <div class="ingredient-item">
                        <select class="ingredient-select">
                            <option value="">選擇原料</option>
                            ${ingredientOptions}
                        </select>
                        <input type="number" class="amount-input" placeholder="用量(g)" min="0" step="0.1">
                        <div class="cost-display">成本: 0</div>
                        <button type="button" class="btn btn-danger" onclick="removeIngredientItem(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary add-ingredient-btn" onclick="addIngredientItem()">
                    <i class="fas fa-plus"></i> 新增原料
                </button>
            </div>
            <div class="cost-summary" id="cost-summary">
                <div class="cost-item">
                    <span>總重量:</span>
                    <span id="total-weight">0 g</span>
                </div>
                <div class="cost-item">
                    <span>總成本:</span>
                    <span id="total-cost">0 元</span>
                </div>
                <div class="cost-item">
                    <span>每克成本:</span>
                    <span id="cost-per-gram">0 元</span>
                </div>
                <div class="cost-item total-cost">
                    <span>每份成本:</span>
                    <span id="cost-per-serving">0 元</span>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">儲存</button>
            </div>
        </form>
    `;

    showModal('新增配方', formContent);
    attachRecipeCalculationEvents();
}

function showAddProductForm() {
    editingItemId = null;
    const recipeOptions = dataStore.recipes.map(recipe => 
        `<option value="${recipe.id}">${recipe.name}</option>`
    ).join('');

    const packagingOptions = dataStore.packaging.map(pkg => 
        `<option value="${pkg.id}">${pkg.name} - ${pkg.cost}元</option>`
    ).join('');

    const formContent = `
        <h3><i class="fas fa-plus"></i> 新增販售商品</h3>
        <form onsubmit="saveProduct(event)">
            <div class="form-group">
                <label for="product-name">商品名稱 *</label>
                <input type="text" id="product-name" required>
            </div>
            <div class="form-group">
                <label for="product-category">商品類別</label>
                <input type="text" id="product-category" placeholder="例：蛋糕、餅乾、麵包">
            </div>
            <div class="form-group">
                <label for="product-selling-price">售價 (元)</label>
                <input type="number" id="product-selling-price" step="0.01" min="0" placeholder="商品售價" onchange="updateProductCost()">
            </div>
            <div class="form-group">
                <label>包含配方</label>
                <div class="recipe-ingredients" id="product-recipes">
                    <div class="ingredient-item">
                        <select class="recipe-select">
                            <option value="">選擇配方</option>
                            ${recipeOptions}
                        </select>
                        <select class="unit-select">
                            <option value="weight">重量 (g)</option>
                            <option value="serving">每份</option>
                        </select>
                        <input type="number" class="amount-input" placeholder="數量" min="0" step="0.1">
                        <div class="cost-display">成本: 0</div>
                        <button type="button" class="btn btn-danger" onclick="removeRecipeItem(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary" onclick="addRecipeItem()">
                    <i class="fas fa-plus"></i> 新增配方
                </button>
            </div>
            <div class="form-group">
                <label>包裝材料</label>
                <div class="recipe-ingredients" id="product-packaging-list">
                    <div class="ingredient-item">
                        <select class="packaging-select">
                            <option value="">選擇包裝</option>
                            ${packagingOptions}
                        </select>
                        <input type="number" class="packaging-quantity-input" placeholder="數量" min="1" value="1">
                        <div class="cost-display">成本: 0</div>
                        <button type="button" class="btn btn-danger" onclick="removePackagingItem(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary" onclick="addPackagingItem()">
                    <i class="fas fa-plus"></i> 新增包裝
                </button>
            </div>
            <div class="cost-summary" id="product-cost-summary">
                <div class="cost-item">
                    <span>配方成本:</span>
                    <span id="recipe-total-cost">0 元</span>
                </div>
                <div class="cost-item">
                    <span>包裝成本:</span>
                    <span id="packaging-total-cost">0 元</span>
                </div>
                <div class="cost-item total-cost">
                    <span>總成本:</span>
                    <span id="product-total-cost">0 元</span>
                </div>
                <div class="cost-item">
                    <span>售價:</span>
                    <span id="product-selling-price-display">0 元</span>
                </div>
                <div class="cost-item profit">
                    <span>利潤:</span>
                    <span id="product-profit">0 元 (0%)</span>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">儲存</button>
            </div>
        </form>
    `;

    showModal('新增販售商品', formContent);
    attachProductCalculationEvents();
}

function showAddPackagingForm() {
    editingItemId = null;
    const formContent = `
        <h3><i class="fas fa-plus"></i> 新增包裝材料</h3>
        <form onsubmit="savePackaging(event)">
            <div class="form-group">
                <label for="packaging-name">包裝名稱 *</label>
                <input type="text" id="packaging-name" required>
            </div>
            <div class="form-group">
                <label for="packaging-category">包裝種類</label>
                <input type="text" id="packaging-category" placeholder="例：盒子、袋子、標籤、緞帶">
            </div>
            <div class="form-group">
                <label for="packaging-cost">包裝成本 (元) *</label>
                <input type="number" id="packaging-cost" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label for="packaging-note">備註</label>
                <textarea id="packaging-note" placeholder="包裝規格、顏色、材質等說明"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">儲存</button>
            </div>
        </form>
    `;

    showModal('新增包裝材料', formContent);
}

function showAddNutritionForm() {
    editingItemId = null;
    const ingredientOptions = dataStore.ingredients.map(ing => 
        `<option value="${ing.name}">${ing.name}</option>`
    ).join('');

    const formContent = `
        <h3><i class="fas fa-plus"></i> 新增營養成分</h3>
        <form onsubmit="saveNutrition(event)">
            <div class="form-group">
                <label for="nutrition-ingredient">原料名稱 *</label>
                <select id="nutrition-ingredient" required>
                    <option value="">選擇原料</option>
                    ${ingredientOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 1; margin-right: 1rem;">
                    <label for="nutrition-calories">熱量 (kcal/100g) *</label>
                    <input type="number" id="nutrition-calories" step="0.1" min="0" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="nutrition-protein">蛋白質 (g/100g)</label>
                    <input type="number" id="nutrition-protein" step="0.1" min="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 1; margin-right: 1rem;">
                    <label for="nutrition-fat">脂肪 (g/100g)</label>
                    <input type="number" id="nutrition-fat" step="0.1" min="0">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="nutrition-saturated-fat">飽和脂肪 (g/100g)</label>
                    <input type="number" id="nutrition-saturated-fat" step="0.1" min="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 1; margin-right: 1rem;">
                    <label for="nutrition-trans-fat">反式脂肪 (g/100g)</label>
                    <input type="number" id="nutrition-trans-fat" step="0.1" min="0">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="nutrition-carbs">碳水化合物 (g/100g)</label>
                    <input type="number" id="nutrition-carbs" step="0.1" min="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 1; margin-right: 1rem;">
                    <label for="nutrition-sugar">糖 (g/100g)</label>
                    <input type="number" id="nutrition-sugar" step="0.1" min="0">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label for="nutrition-sodium">鈉 (mg/100g)</label>
                    <input type="number" id="nutrition-sodium" step="0.1" min="0">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">儲存</button>
            </div>
        </form>
    `;

    showModal('新增營養成分', formContent);
}

// 配方相關功能
function addIngredientItem() {
    const container = document.getElementById('recipe-ingredients');
    const ingredientOptions = dataStore.ingredients.map(ing => 
        `<option value="${ing.id}">${ing.name} (${ing.unit})</option>`
    ).join('');

    const newItem = document.createElement('div');
    newItem.className = 'ingredient-item';
    newItem.innerHTML = `
        <select class="ingredient-select">
            <option value="">選擇原料</option>
            ${ingredientOptions}
        </select>
        <input type="number" class="amount-input" placeholder="用量(g)" min="0" step="0.1">
        <div class="cost-display">成本: 0</div>
        <button type="button" class="btn btn-danger" onclick="removeIngredientItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(newItem);
    attachRecipeCalculationEvents();
}

function removeIngredientItem(button) {
    button.parentElement.remove();
    updateRecipeCost();
}

function attachRecipeCalculationEvents() {
    const container = document.getElementById('recipe-ingredients');
    if (!container) return;

    container.querySelectorAll('select, input').forEach(element => {
        element.addEventListener('change', updateRecipeCost);
        element.addEventListener('input', updateRecipeCost);
    });
}

function updateRecipeCost() {
    const container = document.getElementById('recipe-ingredients');
    if (!container) return;

    let autoTotalWeight = 0;
    let totalCost = 0;

    container.querySelectorAll('.ingredient-item').forEach(item => {
        const select = item.querySelector('.ingredient-select');
        const input = item.querySelector('.amount-input');
        const costDisplay = item.querySelector('.cost-display');

        const ingredientId = parseInt(select.value);
        const amount = parseFloat(input.value) || 0;

        if (ingredientId && amount > 0) {
            const ingredient = dataStore.ingredients.find(ing => ing.id === ingredientId);
            if (ingredient) {
                let costPerGram = ingredient.price;
                if (ingredient.unit === '公斤') {
                    costPerGram = ingredient.price / 1000;
                } else if (ingredient.unit === '公升') {
                    costPerGram = ingredient.price / 1000;
                } else if (ingredient.unit === '顆') {
                    costPerGram = ingredient.price / 50;
                }

                const itemCost = costPerGram * amount;
                costDisplay.textContent = `成本: ${itemCost.toFixed(2)}`;
                totalCost += itemCost;
                autoTotalWeight += amount;
            }
        } else {
            costDisplay.textContent = '成本: 0';
        }
    });

    // 使用手動輸入的總重量或自動計算的重量
    const manualWeight = parseFloat(document.getElementById('recipe-total-weight')?.value) || 0;
    const finalWeight = manualWeight > 0 ? manualWeight : autoTotalWeight;

    // 獲取份數
    const servings = parseInt(document.getElementById('recipe-servings')?.value) || 1;

    document.getElementById('total-weight').textContent = `${finalWeight} g`;
    document.getElementById('total-cost').textContent = `${totalCost.toFixed(2)} 元`;
    document.getElementById('cost-per-gram').textContent = 
        finalWeight > 0 ? `${(totalCost / finalWeight).toFixed(3)} 元` : '0 元';
    document.getElementById('cost-per-serving').textContent = 
        servings > 0 ? `${(totalCost / servings).toFixed(2)} 元` : '0 元';
}

// 包裝相關功能
function addPackagingItem() {
    const container = document.getElementById('product-packaging-list');
    const packagingOptions = dataStore.packaging.map(pkg => 
        `<option value="${pkg.id}">${pkg.name} - ${pkg.cost}元</option>`
    ).join('');

    const newItem = document.createElement('div');
    newItem.className = 'ingredient-item';
    newItem.innerHTML = `
        <select class="packaging-select">
            <option value="">選擇包裝</option>
            ${packagingOptions}
        </select>
        <input type="number" class="packaging-quantity-input" placeholder="數量" min="1" value="1">
        <div class="cost-display">成本: 0</div>
        <button type="button" class="btn btn-danger" onclick="removePackagingItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(newItem);
    attachProductCalculationEvents();
}

function removePackagingItem(button) {
    button.parentElement.remove();
    updateProductCost();
}

// 產品相關功能
function addRecipeItem() {
    const container = document.getElementById('product-recipes');
    const recipeOptions = dataStore.recipes.map(recipe => 
        `<option value="${recipe.id}">${recipe.name}</option>`
    ).join('');

    const newItem = document.createElement('div');
    newItem.className = 'ingredient-item';
    newItem.innerHTML = `
        <select class="recipe-select">
            <option value="">選擇配方</option>
            ${recipeOptions}
        </select>
        <select class="unit-select">
            <option value="weight">重量 (g)</option>
            <option value="serving">每份</option>
        </select>
        <input type="number" class="amount-input" placeholder="數量" min="0" step="0.1">
        <div class="cost-display">成本: 0</div>
        <button type="button" class="btn btn-danger" onclick="removeRecipeItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(newItem);
    attachProductCalculationEvents();
}

function removeRecipeItem(button) {
    button.parentElement.remove();
    updateProductCost();
}

function attachProductCalculationEvents() {
    const recipeContainer = document.getElementById('product-recipes');
    const packagingContainer = document.getElementById('product-packaging-list');

    if (recipeContainer) {
        recipeContainer.querySelectorAll('select, input').forEach(element => {
            element.addEventListener('change', updateProductCost);
            element.addEventListener('input', updateProductCost);
        });
    }

    if (packagingContainer) {
        packagingContainer.querySelectorAll('select, input').forEach(element => {
            element.addEventListener('change', updateProductCost);
            element.addEventListener('input', updateProductCost);
        });
    }
}

function updateProductCost() {
    const recipeContainer = document.getElementById('product-recipes');
    const packagingContainer = document.getElementById('product-packaging-list');
    if (!recipeContainer) return;

    let recipeTotalCost = 0;

    // 計算配方成本
    recipeContainer.querySelectorAll('.ingredient-item').forEach(item => {
        const recipeSelect = item.querySelector('.recipe-select');
        const unitSelect = item.querySelector('.unit-select');
        const amountInput = item.querySelector('.amount-input');
        const costDisplay = item.querySelector('.cost-display');

        const recipeId = parseInt(recipeSelect.value);
        const unit = unitSelect ? unitSelect.value : 'weight';
        const amount = parseFloat(amountInput.value) || 0;

        if (recipeId && amount > 0) {
            const recipe = dataStore.recipes.find(r => r.id === recipeId);
            if (recipe) {
                const recipeCost = calculateRecipeCost(recipe);
                let itemCost = 0;

                if (unit === 'serving') {
                    // 按份數計算
                    const servings = recipe.servings || 1;
                    const costPerServing = recipeCost / servings;
                    itemCost = costPerServing * amount;
                } else {
                    // 按重量計算
                    const recipeWeight = recipe.totalWeight || calculateRecipeWeight(recipe);
                    const costPerGram = recipeWeight > 0 ? recipeCost / recipeWeight : 0;
                    itemCost = costPerGram * amount;
                }

                costDisplay.textContent = `成本: ${itemCost.toFixed(2)}`;
                recipeTotalCost += itemCost;
            }
        } else {
            costDisplay.textContent = '成本: 0';
        }
    });

    // 計算包裝成本
    let packagingTotalCost = 0;

    if (packagingContainer) {
        packagingContainer.querySelectorAll('.ingredient-item').forEach(item => {
            const select = item.querySelector('.packaging-select');
            const input = item.querySelector('.packaging-quantity-input');
            const costDisplay = item.querySelector('.cost-display');

            const packagingId = parseInt(select.value);
            const quantity = parseInt(input.value) || 1;

            if (packagingId && quantity > 0) {
                const packaging = dataStore.packaging.find(p => p.id === packagingId);
                if (packaging) {
                    const itemCost = packaging.cost * quantity;
                    costDisplay.textContent = `成本: ${itemCost.toFixed(2)}`;
                    packagingTotalCost += itemCost;
                }
            } else {
                costDisplay.textContent = '成本: 0';
            }
        });
    }

    // 獲取售價
    const sellingPriceInput = document.getElementById('product-selling-price');
    const sellingPrice = parseFloat(sellingPriceInput ? sellingPriceInput.value : 0) || 0;

    const totalCost = recipeTotalCost + packagingTotalCost;
    const profit = sellingPrice - totalCost;
    const profitMargin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;

    // 更新顯示
    document.getElementById('recipe-total-cost').textContent = `${recipeTotalCost.toFixed(2)} 元`;
    document.getElementById('packaging-total-cost').textContent = `${packagingTotalCost.toFixed(2)} 元`;
    document.getElementById('product-total-cost').textContent = `${totalCost.toFixed(2)} 元`;

    if (document.getElementById('product-selling-price-display')) {
        document.getElementById('product-selling-price-display').textContent = `${sellingPrice.toFixed(2)} 元`;
    }

    if (document.getElementById('product-profit')) {
        const profitElement = document.getElementById('product-profit');
        profitElement.textContent = `${profit.toFixed(2)} 元 (${profitMargin}%)`;
        profitElement.className = profit >= 0 ? 'profit-positive' : 'profit-negative';
    }
}

// 儲存功能
function saveIngredient(event) {
    event.preventDefault();

    const name = document.getElementById('ingredient-name').value;
    const category = document.getElementById('ingredient-category').value;
    const unit = document.getElementById('ingredient-unit').value;
    const price = parseFloat(document.getElementById('ingredient-price').value);

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.ingredients.find(ing => ing.id === editingItemId);
        if (item) {
            item.name = name;
            item.category = category;
            item.unit = unit;
            item.price = price;
        }
    } else {
        // 新增項目
        const newIngredient = {
            id: generateId('ingredients'),
            name: name,
            category: category,
            unit: unit,
            price: price
        };
        dataStore.ingredients.push(newIngredient);
    }

    saveDataToStorage();
    renderTable('ingredients');
    closeModal();
    showNotification(editingItemId ? '原料更新成功' : '原料新增成功', 'success');
}

function saveRecipe(event) {
    event.preventDefault();

    const name = document.getElementById('recipe-name').value;
    const category = document.getElementById('recipe-category').value;
    const servings = parseInt(document.getElementById('recipe-servings').value) || 1;
    const totalWeight = parseFloat(document.getElementById('recipe-total-weight').value) || 0;
    const container = document.getElementById('recipe-ingredients');
    const ingredients = [];

    container.querySelectorAll('.ingredient-item').forEach(item => {
        const select = item.querySelector('.ingredient-select');
        const input = item.querySelector('.amount-input');

        const ingredientId = parseInt(select.value);
        const amount = parseFloat(input.value) || 0;

        if (ingredientId && amount > 0) {
            ingredients.push({
                ingredientId: ingredientId,
                amount: amount
            });
        }
    });

    if (ingredients.length === 0) {
        showNotification('請至少添加一個原料', 'error');
        return;
    }

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.recipes.find(recipe => recipe.id === editingItemId);
        if (item) {
            item.name = name;
            item.category = category;
            item.servings = servings;
            item.totalWeight = totalWeight;
            item.ingredients = ingredients;
        }
    } else {
        // 新增項目
        const newRecipe = {
            id: generateId('recipes'),
            name: name,
            category: category,
            servings: servings,
            totalWeight: totalWeight,
            ingredients: ingredients
        };
        dataStore.recipes.push(newRecipe);
    }

    saveDataToStorage();
    renderTable('recipes');
    closeModal();
    showNotification(editingItemId ? '配方更新成功' : '配方新增成功', 'success');
}

function saveProduct(event) {
    event.preventDefault();

    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const sellingPrice = parseFloat(document.getElementById('product-selling-price').value) || 0;
    const container = document.getElementById('product-recipes');
    const recipes = [];

    container.querySelectorAll('.ingredient-item').forEach(item => {
        const recipeSelect = item.querySelector('.recipe-select');
        const unitSelect = item.querySelector('.unit-select');
        const amountInput = item.querySelector('.amount-input');

        const recipeId = parseInt(recipeSelect.value);
        const unit = unitSelect ? unitSelect.value : 'weight';
        const amount = parseFloat(amountInput.value) || 0;

        if (recipeId && amount > 0) {
            const recipe = dataStore.recipes.find(r => r.id === recipeId);
            if (recipe) {
                recipes.push({
                    recipeId: recipeId,
                    name: recipe.name,
                    amount: amount,
                    unit: unit
                });
            }
        }
    });

    if (recipes.length === 0) {
        showNotification('請至少添加一個配方', 'error');
        return;
    }

    // 包裝資訊
    const packagingContainer = document.getElementById('product-packaging-list');
    const packaging = [];

    if (packagingContainer) {
        packagingContainer.querySelectorAll('.ingredient-item').forEach(item => {
            const select = item.querySelector('.packaging-select');
            const input = item.querySelector('.packaging-quantity-input');

            const packagingId = parseInt(select.value);
            const quantity = parseInt(input.value) || 1;

            if (packagingId && quantity > 0) {
                const packagingItem = dataStore.packaging.find(p => p.id === packagingId);
                if (packagingItem) {
                    packaging.push({
                        packagingId: packagingId,
                        name: packagingItem.name,
                        quantity: quantity
                    });
                }
            }
        });
    }

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.products.find(product => product.id === editingItemId);
        if (item) {
            item.name = name;
            item.category = category;
            item.sellingPrice = sellingPrice;
            item.recipes = recipes;
            item.packaging = packaging;
        }
    } else {
        // 新增項目
        const newProduct = {
            id: generateId('products'),
            name: name,
            category: category,
            sellingPrice: sellingPrice,
            recipes: recipes,
            packaging: packaging
        };
        dataStore.products.push(newProduct);
    }

    saveDataToStorage();
    renderTable('products');
    closeModal();
    showNotification(editingItemId ? '商品更新成功' : '商品新增成功', 'success');
}

function savePackaging(event) {
    event.preventDefault();

    const name = document.getElementById('packaging-name').value;
    const category = document.getElementById('packaging-category').value;
    const cost = parseFloat(document.getElementById('packaging-cost').value);
    const note = document.getElementById('packaging-note').value;

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.packaging.find(pkg => pkg.id === editingItemId);
        if (item) {
            item.name = name;
            item.category = category;
            item.cost = cost;
            item.note = note;
        }
    } else {
        // 新增項目
        const newPackaging = {
            id: generateId('packaging'),
            name: name,
            category: category,
            cost: cost,
            note: note
        };
        dataStore.packaging.push(newPackaging);
    }

    saveDataToStorage();
    renderTable('packaging');
    closeModal();
    showNotification(editingItemId ? '包裝更新成功' : '包裝新增成功', 'success');
}

function saveNutrition(event) {
    event.preventDefault();

    const ingredient = document.getElementById('nutrition-ingredient').value;
    const calories = parseFloat(document.getElementById('nutrition-calories').value);
    const protein = parseFloat(document.getElementById('nutrition-protein').value) || 0;
    const fat = parseFloat(document.getElementById('nutrition-fat').value) || 0;
    const saturatedFat = parseFloat(document.getElementById('nutrition-saturated-fat').value) || 0;
    const transFat = parseFloat(document.getElementById('nutrition-trans-fat').value) || 0;
    const carbs = parseFloat(document.getElementById('nutrition-carbs').value) || 0;
    const sugar = parseFloat(document.getElementById('nutrition-sugar').value) || 0;
    const sodium = parseFloat(document.getElementById('nutrition-sodium').value) || 0;

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.nutrition.find(nut => nut.id === editingItemId);
        if (item) {
            item.ingredient = ingredient;
            item.calories = calories;
            item.protein = protein;
            item.fat = fat;
            item.saturatedFat = saturatedFat;
            item.transFat = transFat;
            item.carbs = carbs;
            item.sugar = sugar;
            item.sodium = sodium;
        }
    } else {
        // 新增項目
        const newNutrition = {
            id: generateId('nutrition'),
            ingredient: ingredient,
            calories: calories,
            protein: protein,
            fat: fat,
            saturatedFat: saturatedFat,
            transFat: transFat,
            carbs: carbs,
            sugar: sugar,
            sodium: sodium
        };
        dataStore.nutrition.push(newNutrition);
    }

    saveDataToStorage();
    renderTable('nutrition');
    closeModal();
    showNotification(editingItemId ? '營養成分更新成功' : '營養成分新增成功', 'success');
}

// 編輯功能
function editItem(type, id) {
    editingItemId = id;
    const item = dataStore[type].find(i => i.id === id);
    if (!item) return;

    switch(type) {
        case 'ingredients':
            editIngredient(item);
            break;
        case 'recipes':
            editRecipe(item);
            break;
        case 'products':
            editProduct(item);
            break;
        case 'packaging':
            editPackaging(item);
            break;
        case 'nutrition':
            editNutrition(item);
            break;
    }
}

function editIngredient(item) {
    showAddIngredientForm();
    setTimeout(() => {
        document.getElementById('ingredient-name').value = item.name;
        document.getElementById('ingredient-category').value = item.category || '';
        document.getElementById('ingredient-unit').value = item.unit;
        document.getElementById('ingredient-price').value = item.price;
        document.querySelector('#modal h3').innerHTML = '<i class="fas fa-edit"></i> 編輯原料';
    }, 100);
}

function editRecipe(item) {
    showAddRecipeForm();
    setTimeout(() => {
        document.getElementById('recipe-name').value = item.name;
        document.getElementById('recipe-category').value = item.category || '';
        document.getElementById('recipe-servings').value = item.servings || 1;
        document.getElementById('recipe-total-weight').value = item.totalWeight || '';
        document.querySelector('#modal h3').innerHTML = '<i class="fas fa-edit"></i> 編輯配方';

        // 清空現有的原料列表
        const container = document.getElementById('recipe-ingredients');
        container.innerHTML = '';

        // 添加配方中的原料
        if (item.ingredients && item.ingredients.length > 0) {
            item.ingredients.forEach(ingredient => {
                addIngredientItem();
                const lastItem = container.lastElementChild;
                lastItem.querySelector('.ingredient-select').value = ingredient.ingredientId;
                lastItem.querySelector('.amount-input').value = ingredient.amount;
            });
        } else {
            addIngredientItem();
        }

        attachRecipeCalculationEvents();
        updateRecipeCost();
    }, 100);
}

function editProduct(item) {
    showAddProductForm();
    setTimeout(() => {
        document.getElementById('product-name').value = item.name;
        document.getElementById('product-category').value = item.category || '';
        document.getElementById('product-selling-price').value = item.sellingPrice || '';
        document.querySelector('#modal h3').innerHTML = '<i class="fas fa-edit"></i> 編輯販售商品';

        // 清空現有的配方列表
        const container = document.getElementById('product-recipes');
        container.innerHTML = '';

        // 添加商品中的配方
        if (item.recipes && item.recipes.length > 0) {
            item.recipes.forEach(recipe => {
                addRecipeItem();
                const lastItem = container.lastElementChild;
                lastItem.querySelector('.recipe-select').value = recipe.recipeId;

                const unitSelect = lastItem.querySelector('.unit-select');
                const amountInput = lastItem.querySelector('.amount-input');

                if (recipe.unit) {
                    unitSelect.value = recipe.unit;
                    amountInput.value = recipe.amount;
                } else {
                    // 向下相容舊資料
                    unitSelect.value = 'weight';
                    amountInput.value = recipe.weight || recipe.amount || 0;
                }
            });
        } else {
            addRecipeItem();
        }

        // 設定包裝資訊
        const packagingContainer = document.getElementById('product-packaging-list');
        packagingContainer.innerHTML = '';

        if (item.packaging && Array.isArray(item.packaging) && item.packaging.length > 0) {
            item.packaging.forEach(packaging => {
                addPackagingItem();
                const lastItem = packagingContainer.lastElementChild;
                lastItem.querySelector('.packaging-select').value = packaging.packagingId;
                lastItem.querySelector('.packaging-quantity-input').value = packaging.quantity;
            });
        } else {
            addPackagingItem();
        }

        attachProductCalculationEvents();
        updateProductCost();
    }, 100);
}

function editPackaging(item) {
    showAddPackagingForm();
    setTimeout(() => {
        document.getElementById('packaging-name').value = item.name;
        document.getElementById('packaging-category').value = item.category || '';
        document.getElementById('packaging-cost').value = item.cost;
        document.getElementById('packaging-note').value = item.note || '';
        document.querySelector('#modal h3').innerHTML = '<i class="fas fa-edit"></i> 編輯包裝材料';
    }, 100);
}

function editNutrition(item) {
    showAddNutritionForm();
    setTimeout(() => {
        document.getElementById('nutrition-ingredient').value = item.ingredient;
        document.getElementById('nutrition-calories').value = item.calories;
        document.getElementById('nutrition-protein').value = item.protein || 0;
        document.getElementById('nutrition-fat').value = item.fat || 0;
        document.getElementById('nutrition-saturated-fat').value = item.saturatedFat || 0;
        document.getElementById('nutrition-trans-fat').value = item.transFat || 0;
        document.getElementById('nutrition-carbs').value = item.carbs || 0;
        document.getElementById('nutrition-sugar').value = item.sugar || 0;
        document.getElementById('nutrition-sodium').value = item.sodium || 0;
        document.querySelector('#modal h3').innerHTML = '<i class="fas fa-edit"></i> 編輯營養成分';
    }, 100);
}

// 詳細資訊查看
function viewRecipeDetails(recipeId) {
    const recipe = dataStore.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const totalCost = calculateRecipeCost(recipe);
    const totalWeight = calculateRecipeWeight(recipe);
    const costPerGram = totalWeight > 0 ? (totalCost / totalWeight).toFixed(3) : 0;

    let ingredientsList = '';
    if (recipe.ingredients) {
        ingredientsList = recipe.ingredients.map(recipeIngredient => {
            const ingredient = dataStore.ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
            if (ingredient) {
                let costPerGram = ingredient.price;
                if (ingredient.unit === '公斤') {
                    costPerGram = ingredient.price / 1000;
                } else if (ingredient.unit === '公升') {
                    costPerGram = ingredient.price / 1000;
                } else if (ingredient.unit === '顆') {
                    costPerGram = ingredient.price / 50;
                }

                const itemCost = costPerGram * recipeIngredient.amount;
                return `
                    <tr>
                        <td>${ingredient.name}</td>
                        <td>${recipeIngredient.amount}g</td>
                        <td>${ingredient.price}元/${ingredient.unit}</td>
                        <td>${itemCost.toFixed(2)}元</td>
                    </tr>
                `;
            }
            return '';
        }).join('');
    }

    const content = `
        <h3><i class="fas fa-utensils"></i> ${recipe.name} - 配方詳情</h3>
        <div class="recipe-details">
            <div class="cost-summary">
                <div class="cost-item">
                    <span>總重量:</span>
                    <span>${totalWeight}g</span>
                </div>
                <div class="cost-item">
                    <span>總成本:</span>
                    <span>${totalCost.toFixed(2)}元</span>
                </div>
                <div class="cost-item total-cost">
                    <span>每克成本:</span>
                    <span>${costPerGram}元</span>
                </div>
            </div>

            <h4>原料明細:</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>原料名稱</th>
                        <th>用量</th>
                        <th>單價</th>
                        <th>成本</th>
                    </tr>
                </thead>
                <tbody>
                    ${ingredientsList}
                </tbody>
            </table>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">關閉</button>
        </div>
    `;

    showModal('配方詳情', content);
}

function viewProductDetails(productId) {
    const product = dataStore.products.find(p => p.id === productId);
    if (!product) return;

    const totalCost = calculateProductCost(product);

    let recipesList = '';
    let recipeTotalCost = 0;

    if (product.recipes) {
        recipesList = product.recipes.map(productRecipe => {
            const recipe = dataStore.recipes.find(r => r.id === productRecipe.recipeId);
            if (recipe) {
                const recipeCost = calculateRecipeCost(recipe);
                const recipeWeight = calculateRecipeWeight(recipe);
                const costPerGram = recipeWeight > 0 ? recipeCost / recipeWeight : 0;
                const itemCost = costPerGram * productRecipe.weight;
                recipeTotalCost += itemCost;

                return `
                    <tr>
                        <td>${recipe.name}</td>
                        <td>${productRecipe.weight}g</td>
                        <td>${costPerGram.toFixed(3)}元/g</td>
                        <td>${itemCost.toFixed(2)}元</td>
                    </tr>
                `;
            }
            return '';
        }).join('');
    }

    let packagingCost = 0;
    let packagingInfo = '無';
    if (product.packaging) {
        const packaging = dataStore.packaging.find(p => p.id === product.packaging.packagingId);
        if (packaging) {
            packagingCost = packaging.cost * product.packaging.quantity;
            packagingInfo = `${packaging.name} x ${product.packaging.quantity} = ${packagingCost}元`;
        }
    }

    const content = `
        <h3><i class="fas fa-shopping-cart"></i> ${product.name} - 商品詳情</h3>
        <div class="product-details">
            <div class="form-group">
                <label>商品類別:</label>
                <p>${product.category || '未分類'}</p>
            </div>

            <div class="cost-summary">
                <div class="cost-item">
                    <span>配方成本:</span>
                    <span>${recipeTotalCost.toFixed(2)}元</span>
                </div>
                <div class="cost-item">
                    <span>包裝成本:</span>
                    <span>${packagingCost.toFixed(2)}元</span>
                </div>
                <div class="cost-item total-cost">
                    <span>總成本:</span>
                    <span>${totalCost.toFixed(2)}元</span>
                </div>
            </div>

            <h4>配方明細:</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>配方名稱</th>
                        <th>重量</th>
                        <th>每克成本</th>
                        <th>配方成本</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipesList}
                </tbody>
            </table>

            <h4>包裝資訊:</h4>
            <p>${packagingInfo}</p>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">關閉</button>
        </div>
    `;

    showModal('商品詳情', content);
}

// 匯出匯入功能
function exportData(type) {
    const data = dataStore[type];
    if (data.length === 0) {
        showNotification('暫無資料可匯出', 'warning');
        return;
    }

    let worksheetData;
    let filename = '';

    switch(type) {
        case 'ingredients':
            worksheetData = generateIngredientWorksheetData(data);
            filename = '原料清單.xls';
            break;
        case 'recipes':
            worksheetData = generateRecipeWorksheetData(data);
            filename = '配方清單.xls';
            break;
        case 'products':
            worksheetData = generateProductWorksheetData(data);
            filename = '商品清單.xls';
            break;
        case 'packaging':
            worksheetData = generatePackagingWorksheetData(data);
            filename = '包裝清單.xls';
            break;
        case 'nutrition':
            worksheetData = generateNutritionWorksheetData(data);
            filename = '營養成分清單.xls';
            break;
    }

    // Convert worksheet data to Excel format
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Download the Excel file
    XLSX.writeFile(wb, filename);
    showNotification('匯出成功', 'success');
}
function generateIngredientWorksheetData(data) {
    const headers = ['原料名稱', '原料分類', '單位', '單價'];
    const rows = data.map(item => [
        item.name,
        item.category || '',
        item.unit,
        item.price
    ]);
    return [headers, ...rows];
}

function generateRecipeWorksheetData(data) {
    const headers = ['配方名稱', '配方分類', '總份量', '總重量'];
    const rows = data.map(recipe => [
        recipe.name,
        recipe.category || '',
        recipe.servings || 1,
        recipe.totalWeight || calculateRecipeWeight(recipe)
    ]);
    return [headers, ...rows];
}

function generateProductWorksheetData(data) {
    const headers = ['商品名稱', '商品類別', '售價'];
    const rows = data.map(product => [
        product.name,
        product.category || '',
        product.sellingPrice || ''
    ]);
    return [headers, ...rows];
}

function generatePackagingWorksheetData(data) {
    const headers = ['包裝名稱', '包裝種類', '包裝成本', '備註'];
    const rows = data.map(item => [
        item.name,
        item.category || '',
        item.cost,
        item.note || ''
    ]);
    return [headers, ...rows];
}

function generateNutritionWorksheetData(data) {
    const headers = ['原料名稱', '熱量', '蛋白質', '脂肪', '飽和脂肪', '反式脂肪', '碳水化合物', '糖', '鈉'];
    const rows = data.map(item => [
        item.ingredient,
        item.calories,
        item.protein || 0,
        item.fat || 0,
        item.saturatedFat || 0,
        item.transFat || 0,
        item.carbs || 0,
        item.sugar || 0,
        item.sodium || 0
    ]);
    return [headers, ...rows];
}


function downloadCSV(content, filename) {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importData(type) {
    currentImportType = type;
    document.getElementById('file-input').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            parseAndImportXLS(jsonData, currentImportType);
        } catch (error) {
            console.error('匯入失敗:', error);
            showNotification('檔案格式錯誤，請檢查檔案內容', 'error');
        }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = ''; // 清空檔案輸入
}
function parseAndImportXLS(jsonData, type) {
    if (jsonData.length < 2) {
        showNotification('檔案內容不完整', 'error');
        return;
    }

    const headers = jsonData[0];
    const dataLines = jsonData.slice(1);
    let successCount = 0;
    let errorCount = 0;

    dataLines.forEach((line, index) => {
        try {
            if (line.length === 0) return;

            switch (type) {
                case 'ingredients':
                    importIngredient(line);
                    break;
                case 'recipes':
                    importRecipe(line);
                    break;
                case 'products':
                    importProduct(line);
                    break;
                case 'packaging':
                    importPackaging(line);
                    break;
                case 'nutrition':
                    importNutrition(line);
                    break;
                default:
                    throw new Error('暫不支援此類型的批次匯入');
            }
            successCount++;
        } catch (error) {
            console.error(`第 ${index + 2} 行匯入失敗:`, error);
            errorCount++;
        }
    });

    saveDataToStorage();
    renderTable(type);

    if (successCount > 0) {
        showNotification(`匯入完成: 成功 ${successCount} 筆${errorCount > 0 ? `，失敗 ${errorCount} 筆` : ''}`, 'success');
    } else {
        showNotification('匯入失敗，請檢查檔案格式', 'error');
    }
}


function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current.trim());
    return values.filter(v => v !== '');
}

function importIngredient(values) {
    if (values.length < 3) throw new Error('資料不完整');

    const name = values[0];
    const category = values[1] || '';
    const unit = values[2];
    const price = parseFloat(values[3]);

    if (!name || !unit || isNaN(price)) {
        throw new Error('資料格式錯誤');
    }

    // 檢查是否已存在同名原料
    const existing = dataStore.ingredients.find(ing => ing.name === name);
    if (existing) {
        // 更新現有原料
        existing.category = category;
        existing.unit = unit;
        existing.price = price;
    } else {
        // 新增原料
        dataStore.ingredients.push({
            id: generateId('ingredients'),
            name: name,
            category: category,
            unit: unit,
            price: price
        });
    }
}

function importRecipe(values) {
    if (values.length < 2) throw new Error('資料不完整');

    const name = values[0];
    const category = values[1] || '';
    const servings = parseInt(values[2]) || 1;
    const totalWeight = parseFloat(values[3]) || 0;

    if (!name) {
        throw new Error('資料格式錯誤');
    }

    // 檢查是否已存在同名配方
    const existing = dataStore.recipes.find(recipe => recipe.name === name);
    if (existing) {
        // 更新現有配方
        existing.category = category;
        existing.servings = servings;
        existing.totalWeight = totalWeight;
    } else {
        // 新增配方
        dataStore.recipes.push({
            id: generateId('recipes'),
            name: name,
            category: category,
            servings: servings,
            totalWeight: totalWeight,
            ingredients: []
        });
    }
}

function importProduct(values) {
    if (values.length < 1) throw new Error('資料不完整');

    const name = values[0];
    const category = values[1] || '';
    const sellingPrice = parseFloat(values[2]) || 0;

    if (!name) {
        throw new Error('資料格式錯誤');
    }

    // 檢查是否已存在同名商品
    const existing = dataStore.products.find(product => product.name === name);
    if (existing) {
        // 更新現有商品
        existing.category = category;
        existing.sellingPrice = sellingPrice;
    } else {
        // 新增商品
        dataStore.products.push({
            id: generateId('products'),
            name: name,
            category: category,
            sellingPrice: sellingPrice,
            recipes: [],
            packaging: []
        });
    }
}

function importPackaging(values) {
    if (values.length < 3) throw new Error('資料不完整');

    const name = values[0];
    const category = values[1] || '';
    const cost = parseFloat(values[2]);
    const note = values[3] || '';

    if (!name || isNaN(cost)) {
        throw new Error('資料格式錯誤');
    }

    // 檢查是否已存在同名包裝
    const existing = dataStore.packaging.find(pkg => pkg.name === name);
    if (existing) {
        // 更新現有包裝
        existing.category = category;
        existing.cost = cost;
        existing.note = note;
    } else {
        // 新增包裝
        dataStore.packaging.push({
            id: generateId('packaging'),
            name: name,
            category: category,
            cost: cost,
            note: note
        });
    }
}

function importNutrition(values) {
    if (values.length < 2) throw new Error('資料不完整');

    const ingredient = values[0];
    const calories = parseFloat(values[1]);
    const protein = parseFloat(values[2]) || 0;
    const fat = parseFloat(values[3]) || 0;
    const saturatedFat = parseFloat(values[4]) || 0;
    const transFat = parseFloat(values[5]) || 0;
    const carbs = parseFloat(values[6]) || 0;
    const sugar = parseFloat(values[7]) || 0;
    const sodium = parseFloat(values[8]) || 0;

    if (!ingredient || isNaN(calories)) {
        throw new Error('資料格式錯誤');
    }

    // 檢查是否已存在相同原料的營養成分
    const existing = dataStore.nutrition.find(nut => nut.ingredient === ingredient);
    if (existing) {
        // 更新現有營養成分
        existing.calories = calories;
        existing.protein = protein;
        existing.fat = fat;
        existing.saturatedFat = saturatedFat;
        existing.transFat = transFat;
        existing.carbs = carbs;
        existing.sugar = sugar;
        existing.sodium = sodium;
    } else {
        // 新增營養成分
        dataStore.nutrition.push({
            id: generateId('nutrition'),
            ingredient: ingredient,
            calories: calories,
            protein: protein,
            fat: fat,
            saturatedFat: saturatedFat,
            transFat: transFat,
            carbs: carbs,
            sugar: sugar,
            sodium: sodium
        });
    }
}

function downloadTemplate(type) {
    let csvContent = '';
    let filename = '';

    switch(type) {
        case 'ingredients':
            csvContent = '原料名稱,原料分類,單位,單價\n麵粉,粉類,公斤,35\n雞蛋,蛋奶類,顆,8\n奶油,油脂類,公斤,180\n砂糖,糖類,公斤,25';
            filename = '原料範例.csv';
            break;
        case 'recipes':
            csvContent = '配方名稱,配方分類,總份量,總重量\n海綿蛋糕,蛋糕,6,1200\n巧克力餅乾,餅乾,20,800\n白吐司,麵包,2,1000';
            filename = '配方範例.csv';
            break;
        case 'products':
            csvContent = '商品名稱,商品類別,售價\n6吋海綿蛋糕,蛋糕,380\n巧克力餅乾禮盒,餅乾,250\n白吐司,麵包,65';
            filename = '商品範例.csv';
            break;
        case 'packaging':
            csvContent = '包裝名稱,包裝種類,包裝成本,備註\n蛋糕盒 6吋,盒子,15,白色硬紙盒\n餅乾袋,袋子,2,透明塑膠袋\n麵包袋,袋子,1.5,透明塑膠袋';
            filename = '包裝範例.csv';
            break;
        case 'nutrition':
            csvContent = '原料名稱,熱量,蛋白質,脂肪,飽和脂肪,反式脂肪,碳水化合物,糖,鈉\n麵粉,364,10.3,0.98,0.2,0,76,0.3,2\n雞蛋,155,13,11,3.1,0,1.1,0.6,124\n奶油,717,0.85,81,51,1.5,0.06,0.06,11';
            filename = '營養成分範例.csv';
            break;
        default:
            showNotification('此項目暫不提供範例檔案', 'warning');
            return;
    }

    downloadCSV(csvContent, filename);
    showNotification('範例檔案下載完成', 'success');
}

// 備份與還原功能
function showBackupPanel() {
    const content = `
        <h3><i class="fas fa-database"></i> 資料備份與還原</h3>
        <div class="backup-panel">
            <div class="backup-info">
                <p><i class="fas fa-info-circle"></i> 資料備份功能可以幫您保存所有管理資料，避免意外遺失。</p>
                <p>備份檔案包含：原料、配方、商品、包裝、營養成分等所有資料。</p>
            </div>

            <div class="backup-actions">
                <button class="btn btn-primary" onclick="exportBackup()">
                    <i class="fas fa-download"></i> 匯出備份檔案
                </button>
                <button class="btn btn-warning" onclick="importBackup()">
                    <i class="fas fa-upload"></i> 匯入備份檔案
                </button>
                <button class="btn btn-danger" onclick="clearAllData()">
                    <i class="fas fa-trash-alt"></i> 清空所有資料
                </button>
            </div>

            <div style="margin-top: 2rem;">
                <h4>系統資料統計：</h4>
                <ul style="text-align: left; display: inline-block;">
                    <li>原料：${dataStore.ingredients.length} 項</li>
                    <li>配方：${dataStore.recipes.length} 項</li>
                    <li>商品：${dataStore.products.length} 項</li>
                    <li>包裝：${dataStore.packaging.length} 項</li>
                    <li>營養成分：${dataStore.nutrition.length} 項</li>
                </ul>
            </div>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">關閉</button>
        </div>
    `;

    showModal('資料備份與還原', content);
}

function exportBackup() {
    const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: dataStore
    };

    const jsonContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `烘焙成本管理系統備份_${timestamp}.json`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('備份檔案匯出成功', 'success');
}

function importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);

                if (!backupData.data) {
                    throw new Error('備份檔案格式錯誤');
                }

                if (confirm('匯入備份將覆蓋現有所有資料，確定要繼續嗎？')) {
                    Object.assign(dataStore, backupData.data);
                    saveDataToStorage();
                    renderAllTables();
                    closeModal();
                    showNotification('備份資料匯入成功', 'success');
                }
            } catch (error) {
                console.error('匯入備份失敗:', error);
                showNotification('備份檔案格式錯誤', 'error');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

function clearAllData() {
    if (confirm('警告：此操作將清空所有資料且無法復原，確定要繼續嗎？')) {
        if (confirm('最後確認：您真的要清空所有資料嗎？')) {
            dataStore.ingredients = [];
            dataStore.recipes = [];
            dataStore.products = [];
            dataStore.packaging = [];
            dataStore.nutrition = [];

            saveDataToStorage();
            renderAllTables();
            closeModal();
            showNotification('所有資料已清空', 'warning');
        }
    }
}

// 輔助函數
function getTypeName(type) {
    const names = {
        ingredients: '原料',
        recipes: '配方',
        products: '商品',
        packaging: '包裝',
        nutrition: '營養成分'
    };
    return names[type] || '項目';
}

// 鍵盤快捷鍵
document.addEventListener('keydown', function(event) {
    // ESC 關閉彈出視窗
    if (event.key === 'Escape') {
        closeModal();
    }

    // Ctrl+S 儲存資料
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveDataToStorage();
        showNotification('資料已儲存', 'success');
    }
});

// 頁面離開提醒
window.addEventListener('beforeunload', function(event) {
    saveDataToStorage();
});

// Add SheetJS library
const script = document.createElement('script');
script.src = 'https://unpkg.com/xlsx/dist/xlsx.full.min.js';
document.head.appendChild(script);

// 監聽檔案匯入
document.getElementById('file-input').addEventListener('change', handleFileImport);

console.log('烘焙成本管理系統已載入完成！');

// 新增函數：更新配方營養成分表
function updateRecipeNutritionData() {
    dataStore.recipeNutrition = []; // 清空現有的配方營養成分表

    dataStore.recipes.forEach(recipe => {
        let nutritionData = {
            recipeId: recipe.id,
            name: recipe.name,
            calories: 0,
            protein: 0,
            fat: 0,
            saturatedFat: 0,
            transFat: 0,
            carbs: 0,
            sugar: 0,
            sodium: 0
        };

        if (recipe.ingredients) {
            recipe.ingredients.forEach(recipeIngredient => {
                const ingredient = dataStore.ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
                if (ingredient) {
                    const nutritionInfo = dataStore.nutrition.find(n => n.ingredient === ingredient.name);
                    if (nutritionInfo) {
                        const factor = recipeIngredient.amount / 100; // 假設營養成分是以每100g為單位

                        nutritionData.calories += nutritionInfo.calories * factor;
                        nutritionData.protein += nutritionInfo.protein * factor;
                        nutritionData.fat += nutritionInfo.fat * factor;
                        nutritionData.saturatedFat += nutritionInfo.saturatedFat * factor;
                        nutritionData.transFat += nutritionInfo.transFat * factor;
                        nutritionData.carbs += nutritionInfo.carbs * factor;
                        nutritionData.sugar += nutritionInfo.sugar * factor;
                        nutritionData.sodium += nutritionInfo.sodium * factor;
                    }
                }
            });
        }

        dataStore.recipeNutrition.push(nutritionData);
    });

    saveDataToStorage(); // 更新localStorage
}

// 修正匯出配方資料，包含所有使用的原料及數量
function generateRecipeWorksheetData(data) {
    const headers = ['配方名稱', '配方分類', '總份量', '總重量', '原料及數量'];
    const rows = data.map(recipe => {
        const ingredientsInfo = recipe.ingredients ?
            recipe.ingredients.map(ri => {
                const ingredient = dataStore.ingredients.find(i => i.id === ri.ingredientId);
                return ingredient ? `${ingredient.name}:${ri.amount}` : '';
            }).filter(i => i !== '').join(',') :
            '';

        return [
            recipe.name,
            recipe.category || '',
            recipe.servings || 1,
            recipe.totalWeight || calculateRecipeWeight(recipe),
            ingredientsInfo
        ];
    });
    return [headers, ...rows];
}

// 修正匯入配方資料，包含所有使用的原料及數量
function importRecipe(values) {
    if (values.length < 2) throw new Error('資料不完整');

    const name = values[0];
    const category = values[1] || '';
    const servings = parseInt(values[2]) || 1;
    const totalWeight = parseFloat(values[3]) || 0;
    const ingredientsStr = values[4] || '';

    if (!name) {
        throw new Error('資料格式錯誤');
    }

    let ingredients = [];
    if (ingredientsStr) {
        const ingredientPairs = ingredientsStr.split(',');
        ingredients = ingredientPairs.map(pair => {
            const [ingredientName, amountStr] = pair.split(':');
            const ingredient = dataStore.ingredients.find(i => i.name === ingredientName);
            const amount = parseFloat(amountStr) || 0;
            if (ingredient && amount > 0) {
                return {
                    ingredientId: ingredient.id,
                    amount: amount
                };
            }
            return null;
        }).filter(item => item !== null);
    }

    // 檢查是否已存在同名配方
    const existing = dataStore.recipes.find(recipe => recipe.name === name);
    if (existing) {
        // 更新現有配方
        existing.category = category;
        existing.servings = servings;
        existing.totalWeight = totalWeight;
        existing.ingredients = ingredients;
    } else {
        // 新增配方
        dataStore.recipes.push({
            id: generateId('recipes'),
            name: name,
            category: category,
            servings: servings,
            totalWeight: totalWeight,
            ingredients: ingredients
        });
    }

    updateRecipeNutritionData(); // 更新配方營養成分表
}

//新增 showRecipeNutritionForm 顯示配方營養成分表單
function showRecipeNutritionForm() {
    renderTable('recipeNutrition'); // 渲染配方營養成分表
}

// 修改 renderAllTables 函數，包含 recipeNutrition
function renderAllTables() {
    renderTable('ingredients');
    renderTable('recipes');
    renderTable('products');
    renderTable('packaging');
    renderTable('nutrition');
    renderTable('recipeNutrition'); // 渲染配方營養成分表
}

// 新增 renderRecipeNutritionRow 函數，渲染配方營養成分表行
function renderRecipeNutritionRow(item) {
    return `
        <tr>
            <td><input type="checkbox" value="${item.recipeId}"></td>
            <td>${item.name}</td>
            <td>${item.calories.toFixed(2)}</td>
            <td>${item.protein.toFixed(2) || 0}</td>
            <td>${item.fat.toFixed(2) || 0}</td>
            <td>${item.saturatedFat.toFixed(2) || 0}</td>
            <td>${item.transFat.toFixed(2) || 0}</td>
            <td>${item.carbs.toFixed(2) || 0}</td>
            <td>${item.sugar.toFixed(2) || 0}</td>
            <td>${item.sodium.toFixed(2) || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-danger" onclick="deleteItem('recipeNutrition', ${item.recipeId})">
                        <i class="fas fa-trash"></i> 刪除
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// 修改 renderTable 函數，增加 recipeNutrition 的處理
function renderTable(type) {
    const tbody = document.getElementById(`${type}-tbody`);
    if (!tbody) return;

    const data = dataStore[type];

    if (data && data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>暫無資料</h3>
                    <p>點擊上方按鈕開始新增${getTypeName(type)}</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data ? data.map(item => {
        switch(type) {
            case 'ingredients':
                return renderIngredientRow(item);
            case 'recipes':
                return renderRecipeRow(item);
            case 'products':
                return renderProductRow(item);
            case 'packaging':
                return renderPackagingRow(item);
            case 'nutrition':
                return renderNutritionRow(item);
            case 'recipeNutrition':
                return renderRecipeNutritionRow(item);
            default:
                return '';
        }
    }).join('') : '';
}

// 修改 deleteItem 函數，增加 recipeNutrition 的處理
function deleteItem(type, id) {
    if (confirm('確定要刪除這個項目嗎？')) {
        const index = dataStore[type].findIndex(item => item.recipeId === id);
        if(type === 'recipeNutrition'){
            if (index !== -1) {
                dataStore[type].splice(index, 1);
                saveDataToStorage();
                renderTable(type);
                showNotification('刪除成功', 'success');
            }
        }
        else{
        const index = dataStore[type].findIndex(item => item.id === id);
        if (index !== -1) {
            dataStore[type].splice(index, 1);
            saveDataToStorage();
            renderTable(type);
            showNotification('刪除成功', 'success');
        }
    }
    }
}

// 修改 deleteSelectedItems 函數，增加 recipeNutrition 的處理
function deleteSelectedItems(type) {
    const selectedIds = getSelectedItems(type);
    if (selectedIds.length === 0) {
        showNotification('請先選擇要刪除的項目', 'warning');
        return;
    }

    if (confirm(`確定要刪除選中的 ${selectedIds.length} 個項目嗎？`)) {
        dataStore[type] = dataStore[type].filter(item => !selectedIds.includes(item.recipeId));
        saveDataToStorage();
        renderTable(type);
        showNotification(`成功刪除 ${selectedIds.length} 個項目`, 'success');
    }
}

//新增 營養成分管理頁面 HTML
/*
<div class="page" id="recipeNutrition-page">
        <h2><i class="fas fa-list-alt"></i> 配方營養成分管理</h2>

        <div class="table-actions">
            <div class="search-box">
                <input type="search" id="recipeNutrition-search" placeholder="搜尋配方..." oninput="searchTable('recipeNutrition')">
                <i class="fas fa-search"></i>
            </div>
            <div class="bulk-actions">
                <button class="btn btn-danger" onclick="deleteSelectedItems('recipeNutrition')">
                    <i class="fas fa-trash"></i> 批次刪除
                </button>
            </div>
            <div class="export-actions">
                <button class="btn btn-success" onclick="exportData('recipeNutrition')">
                    <i class="fas fa-file-excel"></i> 匯出資料
                </button>
            </div>
        </div>

        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" onchange="selectAllItems('recipeNutrition', this)"></th>
                        <th>配方名稱</th>
                        <th>熱量</th>
                        <th>蛋白質</th>
                        <th>脂肪</th>
                        <th>飽和脂肪</th>
                        <th>反式脂肪</th>
                        <th>碳水化合物</th>
                        <th>糖</th>
                        <th>鈉</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="recipeNutrition-tbody">
                    <!-- 配方資料將在此處動態生成 -->
                </tbody>
            </table>
        </div>
    </div>
*/

// 新增 exportData 函數的 recipeNutrition 分支
function exportData(type) {
    const data = dataStore[type];
    if (data && data.length === 0) {
        showNotification('暫無資料可匯出', 'warning');
        return;
    }

    let worksheetData;
    let filename = '';

    switch(type) {
        case 'ingredients':
            worksheetData = generateIngredientWorksheetData(data);
            filename = '原料清單.xls';
            break;
        case 'recipes':
            worksheetData = generateRecipeWorksheetData(data);
            filename = '配方清單.xls';
            break;
        case 'products':
            worksheetData = generateProductWorksheetData(data);
            filename = '商品清單.xls';
            break;
        case 'packaging':
            worksheetData = generatePackagingWorksheetData(data);
            filename = '包裝清單.xls';
            break;
        case 'nutrition':
            worksheetData = generateNutritionWorksheetData(data);
            filename = '營養成分清單.xls';
            break;
        case 'recipeNutrition':
            worksheetData = generateRecipeNutritionWorksheetData(data);
            filename = '配方營養成分清單.xls';
            break;
    }

    // Convert worksheet data to Excel format
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Download the Excel file
    XLSX.writeFile(wb, filename);
    showNotification('匯出成功', 'success');
}

// 新增 generateRecipeNutritionWorksheetData 函數
function generateRecipeNutritionWorksheetData(data) {
    const headers = ['配方名稱', '熱量', '蛋白質', '脂肪', '飽和脂肪', '反式脂肪', '碳水化合物', '糖', '鈉'];
    const rows = data.map(item => [
        item.name,
        item.calories,
        item.protein || 0,
        item.fat || 0,
        item.saturatedFat || 0,
        item.transFat || 0,
        item.carbs || 0,
        item.sugar || 0,
        item.sodium || 0
    ]);
    return [headers, ...rows];
}

// 確保在新增、修改產品配方、新增、修改營養成分時亦同步更新
function saveIngredient(event) {
    event.preventDefault();

    const name = document.getElementById('ingredient-name').value;
    const category = document.getElementById('ingredient-category').value;
    const unit = document.getElementById('ingredient-unit').value;
    const price = parseFloat(document.getElementById('ingredient-price').value);

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.ingredients.find(ing => ing.id === editingItemId);
        if (item) {
            item.name = name;
            item.category = category;
            item.unit = unit;
            item.price = price;
        }
    } else {
        // 新增項目
        const newIngredient = {
            id: generateId('ingredients'),
            name: name,
            category: category,
            unit: unit,
            price: price
        };
        dataStore.ingredients.push(newIngredient);
    }

    saveDataToStorage();
    renderTable('ingredients');
    closeModal();
    showNotification(editingItemId ? '原料更新成功' : '原料新增成功', 'success');
    updateRecipeNutritionData(); // 新增或修改原料時更新配方營養成分
}

function saveRecipe(event) {
    event.preventDefault();

    const name = document.getElementById('recipe-name').value;
    const category = document.getElementById('recipe-category').value;
    const servings = parseInt(document.getElementById('recipe-servings').value) || 1;
    const totalWeight = parseFloat(document.getElementById('recipe-total-weight').value) || 0;
    const container = document.getElementById('recipe-ingredients');
    const ingredients = [];

    container.querySelectorAll('.ingredient-item').forEach(item => {
        const select = item.querySelector('.ingredient-select');
        const input = item.querySelector('.amount-input');

        const ingredientId = parseInt(select.value);
        const amount = parseFloat(input.value) || 0;

        if (ingredientId && amount > 0) {
            ingredients.push({
                ingredientId: ingredientId,
                amount: amount
            });
        }
    });

    if (ingredients.length === 0) {
        showNotification('請至少添加一個原料', 'error');
        return;
    }

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.recipes.find(recipe => recipe.id === editingItemId);
        if (item) {
            item.name = name;
            item.category = category;
            item.servings = servings;
            item.totalWeight = totalWeight;
            item.ingredients = ingredients;
        }
    } else {
        // 新增項目
        const newRecipe = {
            id: generateId('recipes'),
            name: name,
            category: category,
            servings: servings,
            totalWeight: totalWeight,
            ingredients: ingredients
        };
        dataStore.recipes.push(newRecipe);
    }

    saveDataToStorage();
    renderTable('recipes');
    closeModal();
    showNotification(editingItemId ? '配方更新成功' : '配方新增成功', 'success');
    updateRecipeNutritionData(); // 新增或修改配方時更新配方營養成分
}

function saveNutrition(event) {
    event.preventDefault();

    const ingredient = document.getElementById('nutrition-ingredient').value;
    const calories = parseFloat(document.getElementById('nutrition-calories').value);
    const protein = parseFloat(document.getElementById('nutrition-protein').value) || 0;
    const fat = parseFloat(document.getElementById('nutrition-fat').value) || 0;
    const saturatedFat = parseFloat(document.getElementById('nutrition-saturated-fat').value) || 0;
    const transFat = parseFloat(document.getElementById('nutrition-trans-fat').value) || 0;
    const carbs = parseFloat(document.getElementById('nutrition-carbs').value) || 0;
    const sugar = parseFloat(document.getElementById('nutrition-sugar').value) || 0;
    const sodium = parseFloat(document.getElementById('nutrition-sodium').value) || 0;

    if (editingItemId) {
        // 編輯現有項目
        const item = dataStore.nutrition.find(nut=> nut.id === editingItemId);
        if (item) {
            item.ingredient = ingredient;
            item.calories = calories;
            item.protein = protein;
            item.fat = fat;
            item.saturatedFat = saturatedFat;
            item.transFat = transFat;
            item.carbs = carbs;
            item.sugar = sugar;
            item.sodium = sodium;
        }
    } else {
        // 新增項目
        const newNutrition = {
            id: generateId('nutrition'),
            ingredient: ingredient,
            calories: calories,
            protein: protein,
            fat: fat,
            saturatedFat: saturatedFat,
            transFat: transFat,
            carbs: carbs,
            sugar: sugar,
            sodium: sodium
        };
        dataStore.nutrition.push(newNutrition);
    }

    saveDataToStorage();
    renderTable('nutrition');
    closeModal();
    showNotification(editingItemId ? '營養成分更新成功' : '營養成分新增成功', 'success');
    updateRecipeNutritionData();// 新增或修改營養成分時更新配方營養成分
}