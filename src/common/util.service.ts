import * as _ from 'lodash';
import * as platform from 'platform';

export class UtilService {
	/**
	 * Get the limit provided by the user, if there is one.
	 * Limit has to be at least 1 and no more than 100, with
	 * a default value of 20.
	 *
	 * @param queryParams
	 * @param maxSize (optional) default: 100
	 * @returns {number}
	 */
	static getLimit(queryParams: Record<string, any>, maxSize = 100): number {
		const limit = queryParams?.size ?? 20;
		return isNaN(limit) ? 20 : Math.max(1, Math.min(maxSize, Math.floor(limit)));
	}

	/**
	 * Page needs to be positive and has no upper bound
	 * @param queryParams
	 * @returns {number}
	 */
	static getPage(queryParams: Record<string, any>): number {
		const page = queryParams?.page ?? 0;
		return isNaN(page) ? 0 : Math.max(0, page);
	}

	/**
	 * Get the sort provided by the user, if there is one.
	 * Limit has to be at least 1 and no more than 100, with
	 * a default value of 20.
	 *
	 * @param queryParams
	 * @param defaultDir (optional) default: ASC
	 * @param defaultSort (optional)
	 * @returns {Array}
	 */
	static getSort(queryParams: Record<string, any>, defaultDir = 'ASC', defaultSort = null) {
		const sort = queryParams?.sort ?? defaultSort;
		const dir = queryParams?.dir ?? defaultDir;
		if (!sort) {
			return null;
		}
		return [{ property: sort, direction: dir }];
	}

	static getPagingResults(pageSize = 20, pageNumber = 0, totalSize = 0, elements = []) {
		if (totalSize === 0) {
			pageNumber = 0;
		}
		return {
			pageSize,
			pageNumber,
			totalSize,
			totalPages: Math.ceil(totalSize / pageSize),
			elements
		};
	}

	/**
	 * Extract given field from request header
	 */
	static getHeaderField(header: Record<string, string>, fieldName: string): string {
		return null == header || null == header[fieldName] ? null : header[fieldName];
	}

	/**
	 * Parses user agent information from request header
	 */
	static getUserAgentFromHeader(header: Record<string, string>): { browser?: string; os?: string } {
		const userAgent = this.getHeaderField(header, 'user-agent');

		let data = {};
		if (null != userAgent) {
			const info = platform.parse(userAgent);
			data = {
				browser: `${info.name} ${info.version}`,
				os: info.os.toString()
			};
		}

		return data;
	}
	/**
	 * Parse an input as a date. Handles various types
	 * of inputs, such as Strings, Date objects, and Numbers.
	 *
	 * @param {date} The input representing a date / timestamp
	 * @returns The timestamp in milliseconds since the Unix epoch
	 */
	static dateParse(date): number | null {
		// Handle nil values, arrays, and functions by simply returning null
		if (_.isNil(date) || _.isArray(date) || _.isFunction(date)) {
			return null;
		}

		// Date object should return its time in milliseconds
		if (_.isDate(date)) {
			return date.getTime();
		}

		// A number that exists will be interpreted as millisecond
		if (_.isFinite(date)) {
			return date;
		}

		// Handle number string
		if (!isNaN(date)) {
			return +date;
		}

		// Handle String, Object, etc.
		const parsed = Date.parse(date);

		// A string that cannot be parsed returns NaN
		if (isNaN(parsed)) {
			return null;
		}

		return parsed;
	}

	static emailMatcher = /.+@.+\..+/;
}
