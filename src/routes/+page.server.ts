import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PRIVATE_SPOONACULAR_KEY, PRIVATE_WEBSITE_URL } from '$env/static/private'
import { PUBLIC_WEBSITE_URL } from '$env/static/public'
import { dev } from '$app/environment';
import { goto } from '$app/navigation';

export const actions: Actions = {
	async login({
		request,
		locals: { supabase }
	}): Promise<ActionFailure<{ error: string; values?: { email: string } }> | { message: string; login: boolean }> {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, {
				error: 'Please enter your email'
			});
		}
		if (!password) {
			return fail(400, {
				error: 'Please enter your password',
				values: {
					email
				}
			});
		}

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email
					}
				});
			}
			return fail(500, {
				error: 'Server error. Try again later.',
				values: {
					email
				}
			});
		}

		return {
			message: 'Logged in.',
			login: true,
		};
	},

	async register({
		request,
		locals: { supabase }
	}): Promise<ActionFailure<{ error: string; values?: { email: string } }> | { message: string; login: boolean }> {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, {
				error: 'Please enter your email'
			});
		}
		if (!password) {
			return fail(400, {
				error: 'Please enter a password',
				values: {
					email
				}
			});
		}

		const { error, data } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: dev ? PUBLIC_WEBSITE_URL : PRIVATE_WEBSITE_URL }
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.',
					values: {
						email
					}
				});
			}

			return fail(500, {
				error: 'Server error. Try again later.',
				values: {
					email
				}
			});
		}

		if (data?.user?.identities?.length === 0) {
			return fail(400, {
				error: 'This user already exists!',
				values: {
					email
				}
			});
		}

		return {
			message: 'Please check your email to confirm your account.',
			login: false,
		};
	},

	async logout({ locals: { supabase } }) {
		await supabase.auth.signOut();
		throw redirect(303, '/');
	},

	async fetchRecipes({
		request,
	}): Promise<ActionFailure<{ error: string }> | { recipes: App.Recipe[] }> {
		const formData = await request.formData();
		const type = formData.get('type') as string;
		const ingredients = (formData.getAll('ingredients') as string[]).join(',');
		const title = formData.get('title') as string;
		let response:any;
		
		if (type === 'ingredients') {
			if (!ingredients) {
				return fail(400, {
					error: 'Please enter at least one ingredient'
				});
			}

			response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=20&ranking=2&ignorePantry=true&apiKey=${PRIVATE_SPOONACULAR_KEY}`)
		} else  {
			if (!title) {
				return fail(400, {
					error: 'Please enter a title'
				});
			}

			response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${title}&number=20&addRecipeInformation=true&apiKey=${PRIVATE_SPOONACULAR_KEY}`);
		}

		if (response.status === 200) {
			let res:any = await response.json();
			return {
				recipes: type === 'ingredients' ? res : res.results,
			};
		} else {
			return fail(500, {
				error: response.statusText || 'External API request failed. Try again later.'
			});
		}
	},

	async fetchRecipeDetail({
		request,
	}): Promise<ActionFailure<{ error: string }> | { detail: App.RecipeDetail, equipments: App.Equipment[], instructions: App.InstructionStep[] }> {
		const formData = await request.formData();
		const recipeId = formData.get('id') as string;
		const recipeDetail = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${PRIVATE_SPOONACULAR_KEY}`);
		//const recipeEquipments = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/equipmentWidget.json?apiKey=${PRIVATE_SPOONACULAR_KEY}`);
		const recipeInstructions = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${PRIVATE_SPOONACULAR_KEY}`);

		const instructionsData = await recipeInstructions.json();
		// const equipmentsData = await recipeEquipments.json();

		if (recipeDetail.status === 200) {
			return {
				detail: await recipeDetail.json(),
				// equipments: equipmentsData?.equipment,
				equipments: [],
				instructions: instructionsData[0]?.steps,
			};
		} else {
			return fail(500, {
				error: 'External API request failed. Try again later.'
			});
		}
	},

	async loginOAuth({
		url,
		locals: { supabase }
	}): Promise<ActionFailure<{ error: string }>> {
		const provider:any = url.searchParams.get('provider') || 'google';
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: provider,
			options: {
				queryParams: {
					access_type: 'offline',
					prompt: 'consent',
				},
			},
		});

		if (error) {
			return fail(500, {
				error: 'Server error. Try again later.',
			});
		}

		throw redirect(307, data.url as string);
	},
};
