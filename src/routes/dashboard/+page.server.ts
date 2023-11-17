import { error as err, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'
import { PRIVATE_SPOONACULAR_KEY } from '$env/static/private'

export const actions: Actions = {
    default: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const recipeIds = (formData.getAll('recipeIds') as string[]).join(',');
        const response = await fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${recipeIds}&apiKey=${PRIVATE_SPOONACULAR_KEY}`);

        if (response.status === 200) {
            const recipes = await response.json();
            const parsedRecipes: App.Recipe[] = await Promise.all(recipes.map(async (recipe: any) => {
                let { id, image, imageType, aggregateLikes, missedIngredientCount, missedIngredients, title, unusedIngredients, usedIngredientCount, bookmarked } = recipe;
                const { count } = await supabase
                    .from('favourites')
                    .select('*', { count: 'exact', head: true })
                    .eq('recipe_id', recipe.id)

                bookmarked = true;
                let totalLikes: number = 0;
                let likes: number = aggregateLikes;

                if (count !== null) {
                    totalLikes = count + likes;
                }

                return {
                    id,
                    image,
                    imageType,
                    likes,
                    missedIngredientCount,
                    missedIngredients,
                    title,
                    unusedIngredients,
                    usedIngredientCount,
                    bookmarked,
                    totalLikes,
                };
            }));

            const parsedRecipesDetail: App.RecipeDetail[] = await Promise.all(recipes.map(async (recipe: any) => {
                const { id, image, title, readyInMinutes, summary, extendedIngredients, analyzedInstructions } = recipe;
                const steps: App.InstructionStep = analyzedInstructions[0]?.steps;

                // const recipeEquipments = await fetch(`https://api.spoonacular.com/recipes/${id}/equipmentWidget.json?apiKey=${PRIVATE_SPOONACULAR_KEY}`);
                // const equipments: App.Equipment[] = (await recipeEquipments.json()).equipment;
                const equipments: App.Equipment[] = [];

                return {
                    id,
                    image,
                    title,
                    readyInMinutes,
                    summary,
                    extendedIngredients,
                    steps,
                    equipments,
                };
            }));


            return {
                recipes: parsedRecipes,
                recipesDetail: parsedRecipesDetail,
            };
        } else {
            return fail(500, {
				error: 'External API request failed. Try again later.'
			});
        }
    }
}

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
    const session = await getSession();
    if (!session?.user) {
        throw err(401, 'Unauthorized');
    }
};