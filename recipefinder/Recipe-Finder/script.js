document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginPage = document.getElementById('loginPage');
    const recipeFinder = document.getElementById('recipeFinder');
    const favoritesPage = document.getElementById('favoritesPage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const toggleFiltersButton = document.getElementById('toggleFiltersButton');
    const filters = document.getElementById('filters');
    const favoritesPageButton = document.getElementById('favoritesPageButton');
    const backToSearchButton = document.getElementById('backToSearchButton');

    const sampleCredentials = {
        username: 'user',
        password: 'password'
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === sampleCredentials.username && password === sampleCredentials.password) {
            loginPage.style.display = 'none';
            recipeFinder.style.display = 'block';
            displayDefaultRecipes();
        } else {
            alert('Invalid credentials');
        }
    });

    const searchInput = document.querySelector('#searchInput');
    const resultsList = document.querySelector('#results');
    const searchButton = document.querySelector("#searchButton");
    const favoriteRecipesList = document.getElementById('favoriteRecipes');
    let favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];

    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        searchRecipes();
        filters.style.display = 'none';
        toggleFiltersButton.textContent = 'Show Filters';
    });

    toggleFiltersButton.addEventListener('click', () => {
        if (filters.style.display === 'none') {
            filters.style.display = 'block';
            toggleFiltersButton.textContent = 'Hide Filters';
        } else {
            filters.style.display = 'none';
            toggleFiltersButton.textContent = 'Show Filters';
        }
    });

    favoritesPageButton.addEventListener('click', () => {
        recipeFinder.style.display = 'none';
        favoritesPage.style.display = 'block';
        renderFavorites();
    });

    backToSearchButton.addEventListener('click', () => {
        favoritesPage.style.display = 'none';
        recipeFinder.style.display = 'block';
    });

    const appId = 'a2f45675';
    const appKey = '6b51f010b49d53d9b065a8bd4cf66302';

    async function searchRecipes() {
        const searchValue = searchInput.value.trim();
        const calories = document.getElementById('calories').value;
        const diet = document.getElementById('diet').value;
        const health = document.getElementById('health').value;
        const cuisineType = document.getElementById('cuisineType').value;
        const mealType = document.getElementById('mealType').value;
        const dishType = document.getElementById('dishType').value;

        const url = `https://api.edamam.com/search?q=${searchValue}&app_id=${appId}&app_key=${appKey}&from=0&to=20` +
            `${calories ? '&calories=' + calories : ''}` +
            `${diet ? '&diet=' + diet : ''}` +
            `${health ? '&health=' + health : ''}` +
            `${cuisineType ? '&cuisineType=' + cuisineType : ''}` +
            `${mealType ? '&mealType=' + mealType : ''}` +
            `${dishType ? '&dishType=' + dishType : ''}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            displayRecipes(data.hits);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch recipes. Please try again later.');
        }
    }

    function displayRecipes(recipes) {
        let html = '';
        recipes.forEach((recipe) => {
            const recipeData = recipe.recipe;
            html += `
            <li class="recipe-item">
                <div>
                    <img src="${recipeData.image}" alt="${recipeData.label}">
                    <h3>${recipeData.label}</h3>
                    <div class="recipe-details">
                        <p>Time: ${recipeData.totalTime} mins</p>
                        <p>Calories: ${Math.round(recipeData.calories)}</p>
                        <p>Servings: ${recipeData.yield}</p>
                    </div>
                    <div class="ingredients">
                        <h4>Ingredients:</h4>
                        <ul>
                            ${recipeData.ingredientLines.map(ingredient => `<li>${ingredient}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="recipe-link">
                    <a href="${recipeData.url}" target="_blank">View Recipe</a>
                    <button onclick="saveFavorite('${recipeData.uri}', '${recipeData.image}', '${recipeData.label}', '${recipeData.url}')">Save to Favorites</button>
                </div>
            </li>
        `;
        });
        resultsList.innerHTML = html;
    }

    async function displayDefaultRecipes() {
        const url = `https://api.edamam.com/search?q=pork&app_id=${appId}&app_key=${appKey}&from=0&to=20`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            displayRecipes(data.hits);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch recipes. Please try again later.');
        }
    }

    function saveFavorite(uri, image, label, url) {
        const favoriteRecipe = { uri, image, label, url };
        if (!favoriteRecipes.some(recipe => recipe.uri === uri)) {
            favoriteRecipes.push(favoriteRecipe);
            localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
            alert('Recipe saved to favorites!');
        } else {
            alert('Recipe is already in favorites!');
        }
        renderFavorites();
    }

    function renderFavorites() {
        let html = '';
        if (favoriteRecipes.length === 0) {
            html = '<h4>No favorite recipes yet!</h4>';
        } else {
            favoriteRecipes.forEach((recipe) => {
                html += `
                <li class="recipe-item">
                    <div>
                        <img src="${recipe.image}" alt="${recipe.label}">
                        <h3>${recipe.label}</h3>
                    </div>
                    <div class="recipe-link">
                        <a href="${recipe.url}" target="_blank">View Recipe</a>
                        <button onclick="removeFavorite('${recipe.uri}')">Remove</button>
                    </div>
                </li>
            `;
            });
        }
        favoriteRecipesList.innerHTML = html;
    }

    function removeFavorite(uri) {
        favoriteRecipes = favoriteRecipes.filter(recipe => recipe.uri !== uri);
        localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
        renderFavorites();
    }

    // Attach removeFavorite function to global scope
    window.removeFavorite = removeFavorite;
    window.saveFavorite = saveFavorite;
});
