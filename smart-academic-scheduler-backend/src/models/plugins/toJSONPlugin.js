function toJSONPlugin(schema) {
  const existingTransform = schema.options.toJSON && schema.options.toJSON.transform;

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(doc, ret, options) {
      if (existingTransform) {
        existingTransform(doc, ret, options);
      }
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret._id;
      return ret;
    },
  });

  schema.set('timestamps', true);
}

module.exports = toJSONPlugin;
