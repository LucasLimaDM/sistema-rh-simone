migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = col.fields.getByName('role')

    if (roleField) {
      roleField.values = [
        'Admin',
        'Usuario',
        'Encarregado',
        'Instalador Sênior',
        'Instalador Junior',
        'Auxiliar de serviços gerais',
      ]
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = col.fields.getByName('role')

    if (roleField) {
      roleField.values = ['Admin', 'Usuario']
      app.save(col)
    }
  },
)
