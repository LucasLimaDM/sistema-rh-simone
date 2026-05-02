migrate(
  (app) => {
    // Update users collection access rules so managers/users can see the list of all active collaborators
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.listRule = "@request.auth.id != ''"
    usersCol.viewRule = "@request.auth.id != ''"
    app.save(usersCol)

    // Seed a sample user to ensure there's at least one collaborator for the scales
    let sampleUser
    try {
      sampleUser = app.findAuthRecordByEmail('users', 'colaborador@primerpisos.com.br')
    } catch (_) {
      sampleUser = new Record(usersCol)
      sampleUser.setEmail('colaborador@primerpisos.com.br')
      sampleUser.setPassword('Skip@Pass')
      sampleUser.setVerified(true)
      sampleUser.set('name', 'João Silva (Exemplo)')
      sampleUser.set('role', 'Usuario')
      app.save(sampleUser)
    }

    // Seed initial work scale data for testing
    const scalesCol = app.findCollectionByNameOrId('work_scales')
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dateStr = d.toISOString().split('T')[0] + ' 12:00:00.000Z'

      let existing
      try {
        const records = app.findRecordsByFilter(
          'work_scales',
          `user_id = '${sampleUser.id}' && date = '${dateStr}'`,
          '',
          1,
          0,
        )
        if (records.length > 0) existing = records[0]
      } catch (_) {}

      if (!existing) {
        const scale = new Record(scalesCol)
        scale.set('user_id', sampleUser.id)
        scale.set('date', dateStr)
        scale.set('hours', i === 6 ? 0 : 8) // Example: Sunday off
        scale.set('is_day_off', i === 6)
        scale.set('project_name', i === 6 ? '' : 'Obra Central')
        app.save(scale)
      }
    }
  },
  (app) => {
    // Revert access rules
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    app.save(usersCol)

    // Clean up seeded data
    try {
      const sampleUser = app.findAuthRecordByEmail('users', 'colaborador@primerpisos.com.br')
      const scales = app.findRecordsByFilter(
        'work_scales',
        `user_id = '${sampleUser.id}'`,
        '',
        100,
        0,
      )
      for (const s of scales) {
        app.delete(s)
      }
      app.delete(sampleUser)
    } catch (_) {}
  },
)
