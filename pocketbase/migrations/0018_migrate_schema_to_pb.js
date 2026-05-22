migrate(
  (app) => {
    const companies = app.findCollectionByNameOrId('companies')
    companies.fields.add(new TextField({ name: 'corporate_name' }))
    companies.fields.add(new TextField({ name: 'state_registration' }))
    companies.fields.add(new TextField({ name: 'municipal_registration' }))
    companies.fields.add(new TextField({ name: 'responsible_name' }))
    companies.fields.add(new TextField({ name: 'responsible_cpf' }))
    companies.fields.add(new FileField({ name: 'logo', maxSelect: 1, maxSize: 5242880 }))
    companies.fields.add(new FileField({ name: 'signature', maxSelect: 1, maxSize: 5242880 }))
    app.save(companies)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(new FileField({ name: 'signature', maxSelect: 1, maxSize: 5242880 }))
    users.fields.add(new JSONField({ name: 'settings', maxSize: 1000000 }))
    app.save(users)

    const roles = app.findCollectionByNameOrId('roles')
    roles.fields.add(
      new RelationField({ name: 'company_id', collectionId: companies.id, maxSelect: 1 }),
    )
    app.save(roles)

    const work_scales = app.findCollectionByNameOrId('work_scales')
    work_scales.fields.add(new TextField({ name: 'in1' }))
    work_scales.fields.add(new TextField({ name: 'out1' }))
    work_scales.fields.add(new TextField({ name: 'in2' }))
    work_scales.fields.add(new TextField({ name: 'out2' }))
    app.save(work_scales)

    const contracts = app.findCollectionByNameOrId('contracts')
    const collaborators = app.findCollectionByNameOrId('collaborators')
    contracts.fields.add(
      new RelationField({ name: 'company_id', collectionId: companies.id, maxSelect: 1 }),
    )
    contracts.fields.add(
      new RelationField({ name: 'collaborator_id', collectionId: collaborators.id, maxSelect: 1 }),
    )
    contracts.fields.add(new TextField({ name: 'status' }))
    contracts.fields.add(new NumberField({ name: 'version' }))
    app.save(contracts)

    const witnesses = new Collection({
      name: 'witnesses',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'cpf', type: 'text' },
        { name: 'rg', type: 'text' },
        { name: 'signature', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(witnesses)

    const templates = new Collection({
      name: 'templates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'company_id', type: 'relation', collectionId: companies.id, maxSelect: 1 },
        { name: 'document_type', type: 'text' },
        { name: 'content', type: 'editor', maxSize: 10000000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(templates)

    contracts.fields.add(
      new RelationField({ name: 'template_id', collectionId: templates.id, maxSelect: 1 }),
    )
    app.save(contracts)

    const audit_logs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'entity', type: 'text', required: true },
        { name: 'entity_id', type: 'text', required: true },
        { name: 'action', type: 'text', required: true },
        { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'before', type: 'json', maxSize: 1000000 },
        { name: 'after', type: 'json', maxSize: 1000000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(audit_logs)
  },
  (app) => {
    // no-op down
  },
)
