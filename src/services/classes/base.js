class BaseTemplate {
    constructor(template) {
        if (template && template.pageTarget) {
            template.rootTarget.removeChild(template.pageTarget);
        }
    }

    htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    renderAndInitActions(pageTarget) {
        this.template.rootTarget.append(pageTarget);

        const backIcon = pageTarget.querySelector('i.back-icon');
        const closeIcon = pageTarget.querySelector('i.close-icon');

        if (closeIcon) {
            const aTag = closeIcon.closest('a');
            aTag && aTag.addEventListener('click', (e) => {
                e.preventDefault();
                pageTarget.classList.toggle("hide");
            });
        }

        if (backIcon) {
            const aTag = backIcon.closest('a');
            const step = this.config.getSession('step');

            aTag && aTag.addEventListener('click', (e) => {
                if (step === 'locations') {
                    this.config.setSession('step', 'services');
                    this.template.initPage();
                } else if(step === 'calendar') {
                    this.config.setSession('step', 'locations');
                    this.template.initPage();
                }
                e.preventDefault();
            });
        }
    }
}

module.exports = BaseTemplate;