migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('work_scales')

    if (!col.fields.getByName('start_time')) {
      col.fields.add(new TextField({ name: 'start_time' }))
    }

    if (!col.fields.getByName('end_time')) {
      col.fields.add(new TextField({ name: 'end_time' }))
    }

    const userIdField = col.fields.getByName('user_id')
    if (userIdField) {
      userIdField.required = false
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('work_scales')
    col.fields.removeByName('start_time')
    col.fields.removeByName('end_time')

    const userIdField = col.fields.getByName('user_id')
    if (userIdField) {
      userIdField.required = true
    }

    app.save(col)
  },
)
