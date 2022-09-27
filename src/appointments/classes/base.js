class BaseTemplate {
    htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    initClose(pageTarget) {
        const closeIcon = pageTarget.querySelector('i.close-icon');

        if (closeIcon) {
            const aTag = closeIcon.closest('a');
            aTag && aTag.addEventListener('click', (e) => {
                e.preventDefault();
                pageTarget.classList.toggle("hide");
            });
        }
    }
}

module.exports = BaseTemplate;