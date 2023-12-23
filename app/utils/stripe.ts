export type Plan = 'free' | 'individual' | 'business'
export type PlanInterval = 'monthly' | 'annual'
export type Environment = 'test' | 'production'
export type PlanDetails = {
	plan: Plan
	interval: PlanInterval
	environment: Environment
}

export const priceIds: Record<
	Plan,
	Record<PlanInterval, Record<Environment, string>>
> = {
	free: {
		monthly: {
			test: 'price_1OHDC3CuEkvEX3gvpujbkLWI',
			production: 'price_1OHDC3CuEkvEX3gvpujbkLWI',
		},
		annual: {
			test: 'price_1OHDC3CuEkvEX3gvpujbkLWI',
			production: 'price_1OHDC3CuEkvEX3gvpujbkLWI',
		},
	},
	individual: {
		monthly: {
			test: 'price_1OPSUOCuEkvEX3gvtIe41i0m',
			production: 'price_1OHDDICuEkvEX3gvKPomAw77',
		},
		annual: {
			test: 'price_1OHDDICuEkvEX3gvoqAvdkHv',
			production: 'price_1OHDDICuEkvEX3gvoqAvdkHv',
		},
	},
	business: {
		monthly: {
			test: 'price_1OHHoCCuEkvEX3gvh4bcNJ8Y',
			production: 'price_1OHHoCCuEkvEX3gvh4bcNJ8Y',
		},
		annual: {
			test: 'price_1OHHoCCuEkvEX3gvJUkXoVXF',
			production: 'price_1OHHoCCuEkvEX3gvJUkXoVXF',
		},
	},
}

export function getPriceId(
	plan: Plan,
	interval: PlanInterval,
	environment: Environment,
): string {
	return priceIds[plan][interval][environment]
}
