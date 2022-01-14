import handlebars from 'handlebars'
import fs from 'fs'

/**
 * @method generateHTML
 * @param {String} path - Template path
 * @param {object} args - Data to be passed to the template
 * @returns {string} html - Generated HTML
 * @description Generates HTML from a template and data
 */
export const generateHTML = (path: string, args: object): string => {
    const template = fs.readFileSync(path, 'utf-8')
    const html = handlebars.compile(template)(args)
    return html
}
