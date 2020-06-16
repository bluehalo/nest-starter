import * as mongoose from 'mongoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

const MONGO_TIMEOUT_ERROR_CODE = 50;

function escapeRegex(str) {
	return `${str}`.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}

function generateFilter(query) {
	return Object.assign({}, query);
}

function generateSort(sortArr) {
	return (sortArr || []).reduce((sort, element) => {
		sort[element.property] = element.direction === 'ASC' ? 1 : -1;
		return sort;
	}, {});
}

const pagingQuery = (
	schema,
	filter,
	projection,
	options,
	sort,
	limit,
	offset,
	runCount = true,
	populate = [],
	queryTimeout = 30000,
	countTimeout = 5000
) => {
	// Build the queries
	const countQuery = schema.find(filter).maxTimeMS(countTimeout);
	const resultsQuery = schema
		.find(filter, projection, options)
		.sort(sort)
		.skip(offset)
		.limit(limit)
		.maxTimeMS(queryTimeout)
		.populate(populate);

	// const countPromise = runCount ? countQuery.countDocuments().exec() : Promise.resolve(Number.MAX_SAFE_INTEGER);
	const countPromise = runCount
		? countQuery
				.countDocuments()
				.exec()
				.catch(err => {
					// Hit timeout
					if (err.code === MONGO_TIMEOUT_ERROR_CODE) {
						return Promise.resolve(Number.MAX_SAFE_INTEGER);
					} else {
						return err;
					}
				})
		: Promise.resolve(Number.MAX_SAFE_INTEGER);

	const resultsPromise = resultsQuery.exec();

	return Promise.all([countPromise, resultsPromise]).then(([count, results]) => {
		return { results, count };
	});
};

// Generic contains regex search
const searchContainsQuery = (
	schema,
	query,
	fields,
	search,
	limit,
	offset,
	sortArr,
	runCount,
	populate,
	queryTimeout,
	countTimeout
) => {
	const filter = generateFilter(query);
	const sort = generateSort(sortArr);
	const projection = {};
	const options = {};

	// Add search to the filter
	if (null != search && '' !== search) {
		if (null != fields && fields.length > 0) {
			filter.$or = fields.map(element => {
				const constraint = {};
				constraint[element] = { $regex: new RegExp(escapeRegex(search), 'gim') };
				return constraint;
			});
		}
	}

	return pagingQuery(
		schema,
		filter,
		projection,
		options,
		sort,
		limit,
		offset,
		runCount,
		queryTimeout,
		countTimeout
	);
};

// Generic Full text search
const searchTextQuery = (
	schema,
	query,
	search,
	limit,
	offset,
	sortArr,
	runCount,
	populate,
	queryTimeout,
	countTimeout
) => {
	const filter = generateFilter(query);
	const sort = generateSort(sortArr);
	const projection: any = {};
	const options = {};

	// Add text search to the filter
	if (null != search && '' !== search) {
		filter.$text = { $search: search };

		projection.score = { $meta: 'textScore' };

		// Sort by textScore last if there is a searchTerms
		sort.score = { $meta: 'textScore' };
	}

	return pagingQuery(
		schema,
		filter,
		projection,
		options,
		sort,
		limit,
		offset,
		runCount,
		populate,
		queryTimeout,
		countTimeout
	);
};

export function PagingSearchPlugin(schema: mongoose.Schema<any>): void {
	// Search by text and other criteria
	schema.statics.textSearch = function(
		query,
		search,
		limit,
		offset,
		sortArr,
		runCount,
		populate,
		queryTimeout,
		countTimeout
	) {
		return searchTextQuery(
			this,
			query,
			search,
			limit,
			offset,
			sortArr,
			runCount,
			populate,
			queryTimeout,
			countTimeout
		);
	};

	// Find using a contains/wildcard regex on a fixed set of fields
	schema.statics.containsSearch = function(
		query,
		fields,
		search,
		limit,
		offset,
		sortArr,
		runCount,
		populate,
		queryTimeout,
		countTimeout
	) {
		return searchContainsQuery(
			this,
			query,
			fields,
			search,
			limit,
			offset,
			sortArr,
			runCount,
			populate,
			queryTimeout,
			countTimeout
		);
	};
}

export interface PagingResults<T = any> {
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	totalSize: number;
	elements: T[];
}

export abstract class PagingSearch {
	public static textSearch: <T extends PagingSearch>(
		this: AnyParamConstructor<T>,
		query: any,
		searchTerms: string,
		limit: number,
		offset: number,
		sortArr: any[],
		runCount?: boolean,
		populate?: any | any[],
		queryTimeout?: number,
		countTimeout?: number
	) => Promise<{ results: T[]; count: number }>;

	public static containsSearch: <T extends PagingSearch>(
		this: AnyParamConstructor<T>,
		query: any,
		fields: string[],
		search: string,
		limit: number,
		offset: number,
		sortArr: any[],
		runCount?: boolean,
		populate?: any | any[],
		queryTimeout?: number,
		countTimeout?: number
	) => Promise<{ results: T[]; count: number }>;
}
