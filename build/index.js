"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const _ = require("lodash");
const debug = require('debug')('routing-controllers-openapi');
const decorators_1 = require("./decorators");
const defaultConverters_1 = require("./defaultConverters");
const options_1 = require("./options");
var decorators_2 = require("./decorators");
exports.JSONSchema = decorators_2.JSONSchema;
function validationMetadatasToSchemas(metadatas, userOptions) {
    const options = Object.assign({}, options_1.defaultOptions, userOptions);
    const schemas = _(metadatas)
        .groupBy('target.name')
        .mapValues(ownMetas => {
        const target = ownMetas[0].target;
        const metas = ownMetas.concat(getInheritedMetadatas(target, metadatas));
        const properties = _(metas)
            .groupBy('propertyName')
            .mapValues((propMetas, propKey) => {
            const schema = applyConverters(propMetas, options);
            return applyDecorators(schema, target, options, propKey);
        })
            .value();
        const definitionSchema = {
            properties,
            type: 'object'
        };
        const required = getRequiredPropNames(target, metas, options);
        if (required.length > 0) {
            definitionSchema.required = required;
        }
        return applyDecorators(definitionSchema, target, options, target.name);
    })
        .value();
    return schemas;
}
exports.validationMetadatasToSchemas = validationMetadatasToSchemas;
function getInheritedMetadatas(target, metadatas) {
    return metadatas.filter(d => d.target instanceof Function &&
        target.prototype instanceof d.target &&
        !_.find(metadatas, {
            propertyName: d.propertyName,
            target,
            type: d.type
        }));
}
function applyConverters(propertyMetadatas, options) {
    const converters = Object.assign({}, defaultConverters_1.defaultConverters, options.additionalConverters);
    const convert = (meta) => {
        const converter = converters[meta.type];
        if (!converter) {
            debug('No schema converter found for validation metadata', meta);
            return {};
        }
        const items = _.isFunction(converter) ? converter(meta, options) : converter;
        return meta.each ? { items, type: 'array' } : items;
    };
    return _.merge({}, ...propertyMetadatas.map(convert));
}
function applyDecorators(schema, target, options, propertyName) {
    const additionalSchema = decorators_1.getMetadataSchema(target.prototype, propertyName);
    return _.isFunction(additionalSchema)
        ? additionalSchema(schema, options)
        : _.merge({}, schema, additionalSchema);
}
function getRequiredPropNames(target, metadatas, options) {
    function isDefined(metas) {
        return _.some(metas, { type: class_validator_1.ValidationTypes.IS_DEFINED });
    }
    function isOptional(metas) {
        return _.some(metas, ({ type }) => _.includes([class_validator_1.ValidationTypes.CONDITIONAL_VALIDATION, class_validator_1.ValidationTypes.IS_EMPTY], type));
    }
    return _(metadatas)
        .groupBy('propertyName')
        .pickBy(metas => {
        const [own, inherited] = _.partition(metas, d => d.target === target);
        return options.skipMissingProperties
            ? isDefined(own) || (!isOptional(own) && isDefined(inherited))
            : !(isOptional(own) || isOptional(inherited));
    })
        .keys()
        .value();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBaUQ7QUFFakQsNEJBQTJCO0FBRTNCLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO0FBRTdELDZDQUFnRDtBQUNoRCwyREFBdUQ7QUFDdkQsdUNBQW9EO0FBRXBELDJDQUF5QztBQUFoQyxrQ0FBQSxVQUFVLENBQUE7QUFNbkIsc0NBQ0UsU0FBK0IsRUFDL0IsV0FBK0I7SUFFL0IsTUFBTSxPQUFPLHFCQUNSLHdCQUFjLEVBQ2QsV0FBVyxDQUNmLENBQUE7SUFFRCxNQUFNLE9BQU8sR0FBb0MsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUMxRCxPQUFPLENBQUMsYUFBYSxDQUFDO1NBQ3RCLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNwQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBa0IsQ0FBQTtRQUM3QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBRXZFLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDeEIsT0FBTyxDQUFDLGNBQWMsQ0FBQzthQUN2QixTQUFTLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTtZQUNsRCxPQUFPLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUMxRCxDQUFDLENBQUM7YUFDRCxLQUFLLEVBQUUsQ0FBQTtRQUVWLE1BQU0sZ0JBQWdCLEdBQWlCO1lBQ3JDLFVBQVU7WUFDVixJQUFJLEVBQUUs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