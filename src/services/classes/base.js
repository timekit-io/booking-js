class BaseTemplate {
    constructor(template) {
        if (template && template.pageTarget) {
            if (template.rootTarget.contains(template.errorTarget)) {
                template.rootTarget.removeChild(template.errorTarget);
            }
            if (template.rootTarget.contains(template.pageTarget)) {
                template.rootTarget.removeChild(template.pageTarget);
            }
        }
    }

    htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    renderAndInitActions(pageTarget, isTemplate = false) {
        const templateObj = isTemplate ? this : this.template;

        templateObj.rootTarget.append(pageTarget);

        const defaultOpt = this.config.get('stratergy');
        const stratergy = this.config.getSession('stratergy');

        const backIcon = pageTarget.querySelector('i.back-icon');
        const closeIcon = pageTarget.querySelector('i.close-icon');
        
        if (defaultOpt === stratergy && this.config.noSessions()) {
            pageTarget.classList.add("hide");
        }

        if (closeIcon) {
            const aTag = closeIcon.closest('a');
            aTag && aTag.addEventListener('click', (e) => {
                e.preventDefault();
                pageTarget.classList.toggle("hide");
            });
        }

        if (backIcon) {
            const aTag = backIcon.closest('a');
            if (defaultOpt === stratergy) {
                backIcon.classList.remove("show");
            }
            aTag && aTag.addEventListener('click', (e) => {
                e.preventDefault();

                const defaultOpt = this.config.get('stratergy');
                const stratergy = this.config.getSession('stratergy');     

                if (stratergy === 'service') {
                    this.config.setSession('stratergy', 'location');
                } else if (stratergy === 'location') {
                    this.config.setSession('stratergy', 'service');
                } else if(stratergy === 'calendar') {
                    this.config
                        .destroySessions()
                        .setSession('stratergy', defaultOpt);
                }

                templateObj.initPage();
            });
        }
    }
}

module.exports = BaseTemplate;