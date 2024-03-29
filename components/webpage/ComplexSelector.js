'use strict';

let TextRepresentation = require('./ElementRepresentations').TextRepresentation,
    OuterHTMLRepresentation = require('./ElementRepresentations').OuterHTMLRepresentation,
    AttributeRepresentation = require('./ElementRepresentations').AttributeRepresentation;

function SimpleSelector(selector) {
    this.orig = selector;
    this.selector = selector;
    this.attribute = '';
    this.excludes = [];
    this.index = -1;
    this.representation = TextRepresentation;
    this.relative = false;
}

function ComplexSelector(simple_selector) {
    this.selectors = [];

    let selectors = simple_selector.split(',');

    for (let selector of selectors) {
        let result = new SimpleSelector(selector);

        result.selector = result.selector.replace(/^>/, function() {
            result.relative = true;
            return '';
        });

        result.selector = result.selector.replace(/:eq\((\d+)\)/, function(_, eq) {
            result.index = parseInt(eq);
            return '';
        });

        result.selector = result.selector.replace(/:exclude\((.+?)\)/g, function(_, excl) {
            result.excludes.push(excl);
            return '';
        });

        result.selector = result.selector.replace(/(.*?)\[([a-zA-Z\-]+)\]/, function(_, sel, attr) {
            result.attribute = attr;
            return sel;
        });

        if (result.attribute) {
            switch(result.attribute) {
            case 'outerHTML':
                result.representation = OuterHTMLRepresentation;
                break;
            case 'text':
                result.representation = TextRepresentation;
                break;
            default:
                result.representation = AttributeRepresentation;
            }
        }

        this.selectors.push(result);
    }
}

ComplexSelector.prototype.apply = function($) {
    let cpxsel = this,
        result = [];

    for (let sel of this.selectors) {
        let elements = [];

        if (sel.selector) {
            $(sel.selector).each(function(id, el) {
                if (sel.relative && id) {
                    return;
                }
                elements.push(el);
            });
        } else {
            let el = $.root().children().first();
            elements.push(el);
        }

        for (let i in elements) {
            let el = elements[i],
                repr = new sel.representation($, el, sel);

            if (result[i]) {
                result[i] = result[i] + ' ' + repr.repr();
            } else {
                result.push(repr.repr());
            }
        }

        if (elements.length == 0) {
            result.push('');
        }
    }

    return result;
};

module.exports = ComplexSelector;
