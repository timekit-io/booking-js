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

        const defaultOpt = this.config.get('stratergy');
        const stratergy = this.config.getSession('stratergy');

        const backIcon = pageTarget.querySelector('i.back-icon');
        const closeIcon = pageTarget.querySelector('i.close-icon');

        if (closeIcon) {
            const aTag = closeIcon.closest('a');
            aTag && aTag.addEventListener('click', (e) => {
                e.preventDefault();
                pageTarget.classList.toggle("hide");
                console.log("I am here");
            });
        }

        if (backIcon) {
            const aTag = backIcon.closest('a');
            if (defaultOpt === stratergy) {
                backIcon.classList.remove("show");
            }
            aTag && aTag.addEventListener('click', (e) => {
                const defaultOpt = this.config.get('stratergy');
                const stratergy = this.config.getSession('stratergy');              
                console.log(defaultOpt, stratergy);

                if (stratergy === 'service') {
                    this.config.setSession('stratergy', 'location');
                } else if (stratergy === 'location') {
                    this.config.setSession('stratergy', 'service');
                } else if(stratergy === 'calendar') {
                    if (defaultOpt === "location") {
                        this.config.setSession('stratergy', 'service');
                    } else if (defaultOpt === "service") {
                        this.config.setSession('stratergy', 'location');
                    }
                }
                this.template.initPage();
                e.preventDefault();
            });
        }
    }
}

module.exports = BaseTemplate;