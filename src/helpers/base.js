class BaseTemplate {
    parseHtmlTags(field) {
		if (field.format === 'label') {
			field.title = field.title.replace(/\(\((.*?)\)\)/g, function(match, token) {
				var linkTag = token.split(',');
				return '<a target="_blank" href="' + linkTag[1].trim() + '">' + linkTag[0].trim() + '</a>';
			});
		}
		return field;
	}

    htmlToElement(html) {
        const template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }
}

module.exports = BaseTemplate;