// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import { SupabaseClient, Session } from '@supabase/supabase-js'
import { Database } from '$lib/DatabaseDefinitions'

declare global {
	declare namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
		}

		interface PageData {
			session: Session | null;
		}

		interface Ingredient {
			aisle: string;
			amount: number;
			id: number;
			image: string;
			meta: object[];
			name: string;
			original: string;
			originalName: string;
			unit: string;
			unitLong: string;
			unitShort: string;
		};

		interface Recipe {
			id: number;
			image: string;
			imageType: string;
			likes?: number;
			aggregateLikes: number | 0;
			missedIngredientCount: number;
			missedIngredients: Ingredient[];
			title: string;
			unusedIngredients: Ingredient[];
			usedIngredientCount: number;
			bookmarked: boolean | null;
			totalLikes?: number;
		};

		interface RecipeDetail {
			vegetarian: boolean
			vegan: boolean
			glutenFree: boolean
			dairyFree: boolean
			veryHealthy: boolean
			cheap: boolean
			veryPopular: boolean
			sustainable: boolean
			lowFodmap: boolean
			weightWatcherSmartPoints: number
			gaps: string
			preparationMinutes: number
			cookingMinutes: number
			aggregateLikes: number
			healthScore: number
			creditsText: string
			sourceName: string
			pricePerServing: number
			extendedIngredients: ExtendedIngredient[]
			id: number
			title: string
			readyInMinutes: number
			servings: number
			sourceUrl: string
			image: string
			imageType: string
			summary: string
			cuisines: any[]
			dishTypes: string[]
			diets: string[]
			occasions: any[]
			winePairing: WinePairing
			instructions: any
			analyzedInstructions: any[]
			originalId: any
			spoonacularSourceUrl: string
			steps?: InstructionStep[]
			equipments?: Equipment[]
		}

		interface ExtendedIngredient {
			id: number
			aisle: string
			image: string
			consistency: string
			name: string
			nameClean: string
			original: string
			originalName: string
			amount: number
			unit: string
			meta: string[]
			measures: Measures
		}

		interface Measures {
			us: USMetric
			metric: Metric
		}

		interface USMetric {
			amount: number
			unitShort: string
			unitLong: string
		}

		interface Metric {
			amount: number
			unitShort: string
			unitLong: string
		}

		interface WinePairing {
			pairedWines: string[]
			pairingText: string
			productMatches: ProductMatch[]
		}

		interface ProductMatch {
			id: number
			title: string
			description: string
			price: string
			imageUrl: string
			averageRating: number
			ratingCount: number
			score: number
			link: string
		}

		interface InstructionStep {
			number: number
			step: string
			ingredients: any[]
			equipment: Equipment[]
			length?: Length
		}

		interface Equipment {
			id?: number
			name: string
			localizedName?: string
			image: string
		}

		interface Length {
			number: number
			unit: string
		}
	}
}

export { };