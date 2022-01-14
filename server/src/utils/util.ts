import { url } from '@configs/env'
import { join } from 'path'

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
    if (value === null) {
        return true
    } else if (typeof value !== 'number' && value === '') {
        return true
    } else if (typeof value === 'undefined' || value === undefined) {
        return true
    } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true
    } else {
        return false
    }
}

/**
 * @method asset
 * @param {String} path - The path of the asset
 * @returns {String} url - The URL of the asset
 * @description Returns a URL for the given path
 */
export const asset = (path: string): string => {
    const cleanUrl = url.replace(/\/$/, '')
    const cleanPath = path.replace(/^\//, '')
    return `${cleanUrl}/${cleanPath}`
}

/**
 * @method frontendAsset
 * @param {String} path - The path of the asset
 * @returns {String} path - The output path of the asset
 */
export const frontendAsset = (path: string): string => {
    const cleanPath = path.replace(/^\//, '')
    return join(__dirname, '../../../client/public', cleanPath)
}
