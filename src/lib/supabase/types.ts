// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      auditoria_documento: {
        Row: {
          acao: string
          antes: Json | null
          created_at: string
          depois: Json | null
          entidade: string
          entidade_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          acao: string
          antes?: Json | null
          created_at?: string
          depois?: Json | null
          entidade: string
          entidade_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          acao?: string
          antes?: Json | null
          created_at?: string
          depois?: Json | null
          entidade?: string
          entidade_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'auditoria_documento_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuario_sistema'
            referencedColumns: ['id']
          },
        ]
      }
      campo_modelo: {
        Row: {
          chave_placeholder: string
          config_extra: Json | null
          fonte_dado: string
          id: string
          modelo_id: string
          nome_campo: string
          obrigatorio: boolean
          ordem: number
          tipo: string
        }
        Insert: {
          chave_placeholder: string
          config_extra?: Json | null
          fonte_dado: string
          id?: string
          modelo_id: string
          nome_campo: string
          obrigatorio?: boolean
          ordem?: number
          tipo: string
        }
        Update: {
          chave_placeholder?: string
          config_extra?: Json | null
          fonte_dado?: string
          id?: string
          modelo_id?: string
          nome_campo?: string
          obrigatorio?: boolean
          ordem?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campo_modelo_modelo_id_fkey'
            columns: ['modelo_id']
            isOneToOne: false
            referencedRelation: 'modelo'
            referencedColumns: ['id']
          },
        ]
      }
      cargo: {
        Row: {
          ativo: boolean
          created_at: string
          descricao_rich_text: Json
          empresa_id: string
          id: string
          nome: string
          updated_at: string
          valor_diaria: number
          valor_hora: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao_rich_text?: Json
          empresa_id: string
          id?: string
          nome: string
          updated_at?: string
          valor_diaria?: number
          valor_hora?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao_rich_text?: Json
          empresa_id?: string
          id?: string
          nome?: string
          updated_at?: string
          valor_diaria?: number
          valor_hora?: number
        }
        Relationships: [
          {
            foreignKeyName: 'cargo_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresa_contratante'
            referencedColumns: ['id']
          },
        ]
      }
      catalog_items: {
        Row: {
          acabamento_id: string | null
          aplicacao_id: string | null
          created_at: string
          default_material_price: number | null
          default_mo_price: number | null
          description: string | null
          diversos_id: string | null
          estucamento_id: string | null
          id: string
          mobilizacao_id: string | null
          name: string
          preparacao_id: string | null
          primer_id: string | null
          regularizacao_id: string | null
          unit: string | null
          utilizacao_id: string | null
        }
        Insert: {
          acabamento_id?: string | null
          aplicacao_id?: string | null
          created_at?: string
          default_material_price?: number | null
          default_mo_price?: number | null
          description?: string | null
          diversos_id?: string | null
          estucamento_id?: string | null
          id?: string
          mobilizacao_id?: string | null
          name: string
          preparacao_id?: string | null
          primer_id?: string | null
          regularizacao_id?: string | null
          unit?: string | null
          utilizacao_id?: string | null
        }
        Update: {
          acabamento_id?: string | null
          aplicacao_id?: string | null
          created_at?: string
          default_material_price?: number | null
          default_mo_price?: number | null
          description?: string | null
          diversos_id?: string | null
          estucamento_id?: string | null
          id?: string
          mobilizacao_id?: string | null
          name?: string
          preparacao_id?: string | null
          primer_id?: string | null
          regularizacao_id?: string | null
          unit?: string | null
          utilizacao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'catalog_items_acabamento_id_fkey'
            columns: ['acabamento_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_aplicacao_id_fkey'
            columns: ['aplicacao_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_diversos_id_fkey'
            columns: ['diversos_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_estucamento_id_fkey'
            columns: ['estucamento_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_mobilizacao_id_fkey'
            columns: ['mobilizacao_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_preparacao_id_fkey'
            columns: ['preparacao_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_primer_id_fkey'
            columns: ['primer_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_regularizacao_id_fkey'
            columns: ['regularizacao_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'catalog_items_utilizacao_id_fkey'
            columns: ['utilizacao_id']
            isOneToOne: false
            referencedRelation: 'catalog_stages'
            referencedColumns: ['id']
          },
        ]
      }
      catalog_stages: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          stage_type: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          stage_type: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          stage_type?: string
        }
        Relationships: []
      }
      colaborador: {
        Row: {
          assinatura_url: string | null
          ativo: boolean
          cargo_descricao_snapshot: Json
          cargo_id: string
          cargo_nome_snapshot: string
          cnpj: string | null
          cpf: string
          created_at: string
          dados_dinamicos: Json | null
          data_nascimento: string | null
          email: string
          empresa_id: string
          endereco: Json
          id: string
          nome_completo: string
          rg: string | null
          telefone: string | null
          tipo_colaborador: string
          updated_at: string
          valor_diaria_snapshot: number
          valor_hora_snapshot: number
        }
        Insert: {
          assinatura_url?: string | null
          ativo?: boolean
          cargo_descricao_snapshot?: Json
          cargo_id: string
          cargo_nome_snapshot: string
          cnpj?: string | null
          cpf: string
          created_at?: string
          dados_dinamicos?: Json | null
          data_nascimento?: string | null
          email: string
          empresa_id: string
          endereco?: Json
          id?: string
          nome_completo: string
          rg?: string | null
          telefone?: string | null
          tipo_colaborador: string
          updated_at?: string
          valor_diaria_snapshot?: number
          valor_hora_snapshot?: number
        }
        Update: {
          assinatura_url?: string | null
          ativo?: boolean
          cargo_descricao_snapshot?: Json
          cargo_id?: string
          cargo_nome_snapshot?: string
          cnpj?: string | null
          cpf?: string
          created_at?: string
          dados_dinamicos?: Json | null
          data_nascimento?: string | null
          email?: string
          empresa_id?: string
          endereco?: Json
          id?: string
          nome_completo?: string
          rg?: string | null
          telefone?: string | null
          tipo_colaborador?: string
          updated_at?: string
          valor_diaria_snapshot?: number
          valor_hora_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: 'colaborador_cargo_id_fkey'
            columns: ['cargo_id']
            isOneToOne: false
            referencedRelation: 'cargo'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'colaborador_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresa_contratante'
            referencedColumns: ['id']
          },
        ]
      }
      configuracao_usuario: {
        Row: {
          assinatura_padrao_url: string | null
          created_at: string
          id: string
          notificacoes_email: boolean
          notificacoes_push: boolean
          updated_at: string
          usuario_id: string
        }
        Insert: {
          assinatura_padrao_url?: string | null
          created_at?: string
          id?: string
          notificacoes_email?: boolean
          notificacoes_push?: boolean
          updated_at?: string
          usuario_id: string
        }
        Update: {
          assinatura_padrao_url?: string | null
          created_at?: string
          id?: string
          notificacoes_email?: boolean
          notificacoes_push?: boolean
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'configuracao_usuario_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuario_sistema'
            referencedColumns: ['id']
          },
        ]
      }
      documento_anexo: {
        Row: {
          arquivo_url: string
          created_at: string
          documento_id: string
          id: string
          tipo_anexo: string
        }
        Insert: {
          arquivo_url: string
          created_at?: string
          documento_id: string
          id?: string
          tipo_anexo: string
        }
        Update: {
          arquivo_url?: string
          created_at?: string
          documento_id?: string
          id?: string
          tipo_anexo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documento_anexo_documento_id_fkey'
            columns: ['documento_id']
            isOneToOne: false
            referencedRelation: 'documento_gerado'
            referencedColumns: ['id']
          },
        ]
      }
      documento_gerado: {
        Row: {
          arquivo_pdf_url: string | null
          arquivo_renderizado_url: string | null
          assinatura_colaborador_url: string | null
          campos_editaveis_pdf: Json
          cargo_id: string | null
          colaborador_id: string | null
          created_at: string
          created_by: string
          dados_preenchidos: Json
          empresa_id: string
          id: string
          modelo_id: string
          modelo_versao_id: string
          responsavel_empresa_assinatura_url: string | null
          responsavel_empresa_nome: string | null
          status: string
          testemunha_1_assinatura_url: string | null
          testemunha_1_cpf: string | null
          testemunha_1_nome: string | null
          testemunha_2_assinatura_url: string | null
          testemunha_2_cpf: string | null
          testemunha_2_nome: string | null
          tipo_documento: string
          titulo: string
          updated_at: string
          updated_by: string | null
          versao_atual: number
        }
        Insert: {
          arquivo_pdf_url?: string | null
          arquivo_renderizado_url?: string | null
          assinatura_colaborador_url?: string | null
          campos_editaveis_pdf?: Json
          cargo_id?: string | null
          colaborador_id?: string | null
          created_at?: string
          created_by: string
          dados_preenchidos?: Json
          empresa_id: string
          id?: string
          modelo_id: string
          modelo_versao_id: string
          responsavel_empresa_assinatura_url?: string | null
          responsavel_empresa_nome?: string | null
          status: string
          testemunha_1_assinatura_url?: string | null
          testemunha_1_cpf?: string | null
          testemunha_1_nome?: string | null
          testemunha_2_assinatura_url?: string | null
          testemunha_2_cpf?: string | null
          testemunha_2_nome?: string | null
          tipo_documento: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          versao_atual?: number
        }
        Update: {
          arquivo_pdf_url?: string | null
          arquivo_renderizado_url?: string | null
          assinatura_colaborador_url?: string | null
          campos_editaveis_pdf?: Json
          cargo_id?: string | null
          colaborador_id?: string | null
          created_at?: string
          created_by?: string
          dados_preenchidos?: Json
          empresa_id?: string
          id?: string
          modelo_id?: string
          modelo_versao_id?: string
          responsavel_empresa_assinatura_url?: string | null
          responsavel_empresa_nome?: string | null
          status?: string
          testemunha_1_assinatura_url?: string | null
          testemunha_1_cpf?: string | null
          testemunha_1_nome?: string | null
          testemunha_2_assinatura_url?: string | null
          testemunha_2_cpf?: string | null
          testemunha_2_nome?: string | null
          tipo_documento?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          versao_atual?: number
        }
        Relationships: [
          {
            foreignKeyName: 'documento_gerado_cargo_id_fkey'
            columns: ['cargo_id']
            isOneToOne: false
            referencedRelation: 'cargo'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'colaborador'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'usuario_sistema'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresa_contratante'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_modelo_id_fkey'
            columns: ['modelo_id']
            isOneToOne: false
            referencedRelation: 'modelo'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_modelo_versao_id_fkey'
            columns: ['modelo_versao_id']
            isOneToOne: false
            referencedRelation: 'modelo_versao'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_gerado_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'usuario_sistema'
            referencedColumns: ['id']
          },
        ]
      }
      documento_versao: {
        Row: {
          alterado_por_usuario_id: string
          arquivo_pdf_url: string
          created_at: string
          dados_snapshot: Json
          documento_id: string
          id: string
          motivo_alteracao: string | null
          versao: number
        }
        Insert: {
          alterado_por_usuario_id: string
          arquivo_pdf_url: string
          created_at?: string
          dados_snapshot?: Json
          documento_id: string
          id?: string
          motivo_alteracao?: string | null
          versao: number
        }
        Update: {
          alterado_por_usuario_id?: string
          arquivo_pdf_url?: string
          created_at?: string
          dados_snapshot?: Json
          documento_id?: string
          id?: string
          motivo_alteracao?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: 'documento_versao_alterado_por_usuario_id_fkey'
            columns: ['alterado_por_usuario_id']
            isOneToOne: false
            referencedRelation: 'usuario_sistema'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documento_versao_documento_id_fkey'
            columns: ['documento_id']
            isOneToOne: false
            referencedRelation: 'documento_gerado'
            referencedColumns: ['id']
          },
        ]
      }
      draft_manuals: {
        Row: {
          created_at: string
          id: string
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      draft_proposals: {
        Row: {
          created_at: string
          id: string
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          assunto: string
          conteudo: string
          created_at: string
          id: string
          titulo: string
          user_id: string
        }
        Insert: {
          assunto: string
          conteudo: string
          created_at?: string
          id?: string
          titulo: string
          user_id: string
        }
        Update: {
          assunto?: string
          conteudo?: string
          created_at?: string
          id?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          aberto: boolean
          aberto_em: string | null
          assunto: string
          enviado_em: string
          erro_mensagem: string | null
          followup_id: string | null
          id: string
          lead_id: string | null
          notificacao_vista: boolean
          proposal_id: string | null
          status: string
          token: string
          total_aberturas: number
        }
        Insert: {
          aberto?: boolean
          aberto_em?: string | null
          assunto: string
          enviado_em?: string
          erro_mensagem?: string | null
          followup_id?: string | null
          id?: string
          lead_id?: string | null
          notificacao_vista?: boolean
          proposal_id?: string | null
          status?: string
          token?: string
          total_aberturas?: number
        }
        Update: {
          aberto?: boolean
          aberto_em?: string | null
          assunto?: string
          enviado_em?: string
          erro_mensagem?: string | null
          followup_id?: string | null
          id?: string
          lead_id?: string | null
          notificacao_vista?: boolean
          proposal_id?: string | null
          status?: string
          token?: string
          total_aberturas?: number
        }
        Relationships: [
          {
            foreignKeyName: 'email_tracking_followup_id_fkey'
            columns: ['followup_id']
            isOneToOne: false
            referencedRelation: 'followups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'email_tracking_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'email_tracking_proposal_id_fkey'
            columns: ['proposal_id']
            isOneToOne: false
            referencedRelation: 'proposals'
            referencedColumns: ['id']
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_url: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'employee_documents_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          admission_date: string | null
          bairro: string | null
          birth_date: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          company: string
          company_name: string | null
          complemento: string | null
          contract_type: string
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          invite_status: string | null
          logradouro: string | null
          name: string
          numero: string | null
          observations: string | null
          phone: string | null
          rg: string | null
          role: string
          role_id: string | null
          status: string
          uf: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          bairro?: string | null
          birth_date?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          company: string
          company_name?: string | null
          complemento?: string | null
          contract_type?: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          invite_status?: string | null
          logradouro?: string | null
          name: string
          numero?: string | null
          observations?: string | null
          phone?: string | null
          rg?: string | null
          role: string
          role_id?: string | null
          status?: string
          uf?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          bairro?: string | null
          birth_date?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          company?: string
          company_name?: string | null
          complemento?: string | null
          contract_type?: string
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          invite_status?: string | null
          logradouro?: string | null
          name?: string
          numero?: string | null
          observations?: string | null
          phone?: string | null
          rg?: string | null
          role?: string
          role_id?: string | null
          status?: string
          uf?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'employees_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'hr_roles'
            referencedColumns: ['id']
          },
        ]
      }
      empresa_contratante: {
        Row: {
          assinatura_responsavel_url: string | null
          ativa: boolean
          cnpj: string
          cpf_responsavel: string
          created_at: string
          endereco: Json
          header_template: Json
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logo_url: string | null
          nome_fantasia: string
          nome_responsavel: string
          razao_social: string
          updated_at: string
        }
        Insert: {
          assinatura_responsavel_url?: string | null
          ativa?: boolean
          cnpj: string
          cpf_responsavel: string
          created_at?: string
          endereco?: Json
          header_template?: Json
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logo_url?: string | null
          nome_fantasia: string
          nome_responsavel: string
          razao_social: string
          updated_at?: string
        }
        Update: {
          assinatura_responsavel_url?: string | null
          ativa?: boolean
          cnpj?: string
          cpf_responsavel?: string
          created_at?: string
          endereco?: Json
          header_template?: Json
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logo_url?: string | null
          nome_fantasia?: string
          nome_responsavel?: string
          razao_social?: string
          updated_at?: string
        }
        Relationships: []
      }
      followup_roteiro: {
        Row: {
          concluido: boolean
          created_at: string
          data_prevista: string
          descricao: string
          dia_sequencia: number
          id: string
          lead_id: string
          observacoes: string | null
          tipo: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          data_prevista: string
          descricao: string
          dia_sequencia: number
          id?: string
          lead_id: string
          observacoes?: string | null
          tipo: string
        }
        Update: {
          concluido?: boolean
          created_at?: string
          data_prevista?: string
          descricao?: string
          dia_sequencia?: number
          id?: string
          lead_id?: string
          observacoes?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'followup_roteiro_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      followups: {
        Row: {
          concluido: boolean | null
          created_at: string | null
          data_prevista: string
          id: string
          lead_id: string
          observacoes: string | null
          tipo: string
        }
        Insert: {
          concluido?: boolean | null
          created_at?: string | null
          data_prevista: string
          id?: string
          lead_id: string
          observacoes?: string | null
          tipo: string
        }
        Update: {
          concluido?: boolean | null
          created_at?: string | null
          data_prevista?: string
          id?: string
          lead_id?: string
          observacoes?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'followups_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      general_settings: {
        Row: {
          banco_imagens: Json | null
          clausulas: string | null
          condicoes_gerais: string | null
          condicoes_pagamento: string | null
          created_at: string
          garantia: string | null
          id: string
          manual_caracteristicas: string | null
          manual_conclusao: string | null
          manual_cuidados: string | null
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          banco_imagens?: Json | null
          clausulas?: string | null
          condicoes_gerais?: string | null
          condicoes_pagamento?: string | null
          created_at?: string
          garantia?: string | null
          id?: string
          manual_caracteristicas?: string | null
          manual_conclusao?: string | null
          manual_cuidados?: string | null
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          banco_imagens?: Json | null
          clausulas?: string | null
          condicoes_gerais?: string | null
          condicoes_pagamento?: string | null
          created_at?: string
          garantia?: string | null
          id?: string
          manual_caracteristicas?: string | null
          manual_conclusao?: string | null
          manual_cuidados?: string | null
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          email: string | null
          expires_at: number
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          email?: string | null
          expires_at: number
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          email?: string | null
          expires_at?: number
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      historico_comunicacao: {
        Row: {
          assunto: string
          conteudo: string
          data_comunicacao: string | null
          destinatario: string
          gmail_message_id: string | null
          id: string
          lead_id: string
          remetente: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          assunto: string
          conteudo: string
          data_comunicacao?: string | null
          destinatario: string
          gmail_message_id?: string | null
          id?: string
          lead_id: string
          remetente: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          assunto?: string
          conteudo?: string
          data_comunicacao?: string | null
          destinatario?: string
          gmail_message_id?: string | null
          id?: string
          lead_id?: string
          remetente?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'historico_comunicacao_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      historico_etapas: {
        Row: {
          data_entrada: string
          data_saida: string | null
          etapa: string
          id: string
          lead_id: string
          user_id: string | null
        }
        Insert: {
          data_entrada?: string
          data_saida?: string | null
          etapa: string
          id?: string
          lead_id: string
          user_id?: string | null
        }
        Update: {
          data_entrada?: string
          data_saida?: string | null
          etapa?: string
          id?: string
          lead_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'historico_etapas_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      hr_document_templates: {
        Row: {
          category: string
          company: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          company: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          company?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      hr_generated_documents: {
        Row: {
          company: string
          content: string
          created_at: string
          employee_id: string | null
          id: string
          pdf_url: string | null
          status: string
          template_id: string | null
          title: string
        }
        Insert: {
          company: string
          content: string
          created_at?: string
          employee_id?: string | null
          id?: string
          pdf_url?: string | null
          status?: string
          template_id?: string | null
          title: string
        }
        Update: {
          company?: string
          content?: string
          created_at?: string
          employee_id?: string | null
          id?: string
          pdf_url?: string | null
          status?: string
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'hr_generated_documents_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'hr_generated_documents_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'hr_document_templates'
            referencedColumns: ['id']
          },
        ]
      }
      hr_profiles: {
        Row: {
          avatar_url: string | null
          company: string
          cpf: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          signature_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string
          cpf?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
          signature_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string
          cpf?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          signature_url?: string | null
        }
        Relationships: []
      }
      hr_roles: {
        Row: {
          company: string
          created_at: string
          daily_rate: number
          hourly_rate: number
          id: string
          name: string
        }
        Insert: {
          company: string
          created_at?: string
          daily_rate?: number
          hourly_rate?: number
          id?: string
          name: string
        }
        Update: {
          company?: string
          created_at?: string
          daily_rate?: number
          hourly_rate?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      image_bank: {
        Row: {
          client_name: string
          created_at: string
          folder_id: string | null
          id: string
          industria_id: string | null
          revestimento_id: string | null
          tags: Json | null
          url: string
        }
        Insert: {
          client_name: string
          created_at?: string
          folder_id?: string | null
          id?: string
          industria_id?: string | null
          revestimento_id?: string | null
          tags?: Json | null
          url: string
        }
        Update: {
          client_name?: string
          created_at?: string
          folder_id?: string | null
          id?: string
          industria_id?: string | null
          revestimento_id?: string | null
          tags?: Json | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'image_bank_folder_id_fkey'
            columns: ['folder_id']
            isOneToOne: false
            referencedRelation: 'image_folders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'image_bank_industria_id_fkey'
            columns: ['industria_id']
            isOneToOne: false
            referencedRelation: 'image_industrias'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'image_bank_revestimento_id_fkey'
            columns: ['revestimento_id']
            isOneToOne: false
            referencedRelation: 'image_revestimentos'
            referencedColumns: ['id']
          },
        ]
      }
      image_folders: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      image_industrias: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      image_revestimentos: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          area_m2: number | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj_cpf: string | null
          complemento: string | null
          contato: string
          cpf_cnpj: string | null
          created_at: string | null
          data_entrada: string | null
          email: string | null
          empresa: string
          etapa: string
          id: string
          logo_url: string | null
          logradouro: string | null
          motivo_perda: string | null
          numero: string | null
          numero_proposta: string | null
          observacoes: string | null
          origem: string | null
          responsavel: string | null
          telefone: string | null
          temperatura: string | null
          tipo_revestimento: string | null
          uf: string | null
          updated_at: string | null
          user_id: string
          valor_proposta: number | null
          vendedor_id: string | null
          visita_data: string | null
          visita_relato: string | null
          visita_status: string | null
          visita_vendedor_id: string | null
        }
        Insert: {
          area_m2?: number | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          complemento?: string | null
          contato: string
          cpf_cnpj?: string | null
          created_at?: string | null
          data_entrada?: string | null
          email?: string | null
          empresa: string
          etapa?: string
          id?: string
          logo_url?: string | null
          logradouro?: string | null
          motivo_perda?: string | null
          numero?: string | null
          numero_proposta?: string | null
          observacoes?: string | null
          origem?: string | null
          responsavel?: string | null
          telefone?: string | null
          temperatura?: string | null
          tipo_revestimento?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id: string
          valor_proposta?: number | null
          vendedor_id?: string | null
          visita_data?: string | null
          visita_relato?: string | null
          visita_status?: string | null
          visita_vendedor_id?: string | null
        }
        Update: {
          area_m2?: number | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          complemento?: string | null
          contato?: string
          cpf_cnpj?: string | null
          created_at?: string | null
          data_entrada?: string | null
          email?: string | null
          empresa?: string
          etapa?: string
          id?: string
          logo_url?: string | null
          logradouro?: string | null
          motivo_perda?: string | null
          numero?: string | null
          numero_proposta?: string | null
          observacoes?: string | null
          origem?: string | null
          responsavel?: string | null
          telefone?: string | null
          temperatura?: string | null
          tipo_revestimento?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id?: string
          valor_proposta?: number | null
          vendedor_id?: string | null
          visita_data?: string | null
          visita_relato?: string | null
          visita_status?: string | null
          visita_vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'leads_vendedor_id_fkey'
            columns: ['vendedor_id']
            isOneToOne: false
            referencedRelation: 'vendedores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_visita_vendedor_id_fkey'
            columns: ['visita_vendedor_id']
            isOneToOne: false
            referencedRelation: 'vendedores'
            referencedColumns: ['id']
          },
        ]
      }
      modelo: {
        Row: {
          arquivo_original_url: string
          ativo: boolean
          campos_config: Json
          campos_editaveis_pdf: Json
          created_at: string
          descricao: string | null
          empresa_id: string | null
          id: string
          nome: string
          placeholders: Json
          regras_assinatura: Json
          regras_autopreenchimento: Json
          tipo_documento: string
          updated_at: string
          versao_atual: number
        }
        Insert: {
          arquivo_original_url: string
          ativo?: boolean
          campos_config?: Json
          campos_editaveis_pdf?: Json
          created_at?: string
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          placeholders?: Json
          regras_assinatura?: Json
          regras_autopreenchimento?: Json
          tipo_documento: string
          updated_at?: string
          versao_atual?: number
        }
        Update: {
          arquivo_original_url?: string
          ativo?: boolean
          campos_config?: Json
          campos_editaveis_pdf?: Json
          created_at?: string
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          placeholders?: Json
          regras_assinatura?: Json
          regras_autopreenchimento?: Json
          tipo_documento?: string
          updated_at?: string
          versao_atual?: number
        }
        Relationships: [
          {
            foreignKeyName: 'modelo_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresa_contratante'
            referencedColumns: ['id']
          },
        ]
      }
      modelo_versao: {
        Row: {
          alterado_por_usuario_id: string
          arquivo_url: string
          campos_config_snapshot: Json
          created_at: string
          id: string
          modelo_id: string
          versao: number
        }
        Insert: {
          alterado_por_usuario_id: string
          arquivo_url: string
          campos_config_snapshot?: Json
          created_at?: string
          id?: string
          modelo_id: string
          versao: number
        }
        Update: {
          alterado_por_usuario_id?: string
          arquivo_url?: string
          campos_config_snapshot?: Json
          created_at?: string
          id?: string
          modelo_id?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: 'modelo_versao_alterado_por_usuario_id_fkey'
            columns: ['alterado_por_usuario_id']
            isOneToOne: false
            referencedRelation: 'usuario_sistema'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'modelo_versao_modelo_id_fkey'
            columns: ['modelo_id']
            isOneToOne: false
            referencedRelation: 'modelo'
            referencedColumns: ['id']
          },
        ]
      }
      motivos_perda: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          photos: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photos?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photos?: Json
          user_id?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          user_id?: string
        }
        Relationships: []
      }
      proposal_photos: {
        Row: {
          created_at: string
          id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          arquivado: boolean
          celular: string | null
          cliente: string
          created_at: string
          data: string
          email: string | null
          id: string
          imagem: string | null
          local: string
          numero: string
          state: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivado?: boolean
          celular?: string | null
          cliente: string
          created_at?: string
          data: string
          email?: string | null
          id?: string
          imagem?: string | null
          local: string
          numero: string
          state?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivado?: boolean
          celular?: string | null
          cliente?: string
          created_at?: string
          data?: string
          email?: string | null
          id?: string
          imagem?: string | null
          local?: string
          numero?: string
          state?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_settings: {
        Row: {
          created_at: string
          id: string
          items: Json | null
          name: string
          observation: string | null
          percentage: number
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json | null
          name: string
          observation?: string | null
          percentage?: number
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json | null
          name?: string
          observation?: string | null
          percentage?: number
        }
        Relationships: []
      }
      time_tracks: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          in1: string | null
          in2: string | null
          out1: string | null
          out2: string | null
          total_hours: number | null
          track_date: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          in1?: string | null
          in2?: string | null
          out1?: string | null
          out2?: string | null
          total_hours?: number | null
          track_date: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          in1?: string | null
          in2?: string | null
          out1?: string | null
          out2?: string | null
          total_hours?: number | null
          track_date?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_tracks_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
      user_settings: {
        Row: {
          assinatura_html: string | null
          assinatura_imagem_url: string | null
          configuracoes_alertas: Json | null
          configuracoes_marketing: Json | null
          configuracoes_numeracao: Json | null
          configuracoes_relatorios: Json | null
          configuracoes_tabela: Json | null
          configuracoes_temperatura: Json | null
          configuracoes_whatsapp: Json | null
          created_at: string
          instagram_url: string | null
          logo_url: string | null
          logo_width: number | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          assinatura_html?: string | null
          assinatura_imagem_url?: string | null
          configuracoes_alertas?: Json | null
          configuracoes_marketing?: Json | null
          configuracoes_numeracao?: Json | null
          configuracoes_relatorios?: Json | null
          configuracoes_tabela?: Json | null
          configuracoes_temperatura?: Json | null
          configuracoes_whatsapp?: Json | null
          created_at?: string
          instagram_url?: string | null
          logo_url?: string | null
          logo_width?: number | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          assinatura_html?: string | null
          assinatura_imagem_url?: string | null
          configuracoes_alertas?: Json | null
          configuracoes_marketing?: Json | null
          configuracoes_numeracao?: Json | null
          configuracoes_relatorios?: Json | null
          configuracoes_tabela?: Json | null
          configuracoes_temperatura?: Json | null
          configuracoes_whatsapp?: Json | null
          created_at?: string
          instagram_url?: string | null
          logo_url?: string | null
          logo_width?: number | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      usuario_sistema: {
        Row: {
          assinatura_url: string | null
          ativo: boolean
          cpf: string
          created_at: string
          email: string
          id: string
          nome_completo: string
          senha_hash: string
          tipo_usuario: string
          updated_at: string
        }
        Insert: {
          assinatura_url?: string | null
          ativo?: boolean
          cpf: string
          created_at?: string
          email: string
          id?: string
          nome_completo: string
          senha_hash: string
          tipo_usuario: string
          updated_at?: string
        }
        Update: {
          assinatura_url?: string | null
          ativo?: boolean
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          nome_completo?: string
          senha_hash?: string
          tipo_usuario?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendedores: {
        Row: {
          assinatura_url: string | null
          ativo: boolean
          cargo: string | null
          cpf: string | null
          created_at: string
          email: string
          foto_url: string | null
          id: string
          nome: string
          role: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          assinatura_url?: string | null
          ativo?: boolean
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          foto_url?: string | null
          id?: string
          nome: string
          role?: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          assinatura_url?: string | null
          ativo?: boolean
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          foto_url?: string | null
          id?: string
          nome?: string
          role?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          titulo: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          titulo: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      work_scales: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          period: string
          schedule: Json
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          period: string
          schedule?: Json
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          period?: string
          schedule?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'work_scales_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      format_phone_number: { Args: { p_phone: string }; Returns: string }
      get_auth_user_workspaces: { Args: never; Returns: string[] }
      get_workspace_users: { Args: never; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      merge_leads: {
        Args: {
          p_merged_data: Json
          p_source_lead_id: string
          p_target_lead_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: auditoria_documento
//   id: uuid (not null, default: gen_random_uuid())
//   entidade: text (not null)
//   entidade_id: uuid (not null)
//   acao: text (not null)
//   antes: jsonb (nullable)
//   depois: jsonb (nullable)
//   usuario_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: campo_modelo
//   id: uuid (not null, default: gen_random_uuid())
//   modelo_id: uuid (not null)
//   nome_campo: text (not null)
//   chave_placeholder: text (not null)
//   tipo: text (not null)
//   obrigatorio: boolean (not null, default: false)
//   fonte_dado: text (not null)
//   ordem: integer (not null, default: 0)
//   config_extra: jsonb (nullable)
// Table: cargo
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (not null)
//   nome: text (not null)
//   descricao_rich_text: jsonb (not null, default: '{}'::jsonb)
//   valor_hora: numeric (not null, default: 0)
//   valor_diaria: numeric (not null, default: 0)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: catalog_items
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   unit: text (nullable, default: 'm²'::text)
//   default_mo_price: numeric (nullable, default: 0)
//   default_material_price: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   preparacao_id: uuid (nullable)
//   regularizacao_id: uuid (nullable)
//   aplicacao_id: uuid (nullable)
//   acabamento_id: uuid (nullable)
//   utilizacao_id: uuid (nullable)
//   mobilizacao_id: uuid (nullable)
//   primer_id: uuid (nullable)
//   estucamento_id: uuid (nullable)
//   diversos_id: uuid (nullable)
// Table: catalog_stages
//   id: uuid (not null, default: gen_random_uuid())
//   stage_type: text (not null)
//   name: text (not null)
//   description: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: colaborador
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (not null)
//   tipo_colaborador: text (not null)
//   nome_completo: text (not null)
//   cpf: text (not null)
//   rg: text (nullable)
//   cnpj: text (nullable)
//   data_nascimento: date (nullable)
//   cargo_id: uuid (not null)
//   cargo_nome_snapshot: text (not null)
//   cargo_descricao_snapshot: jsonb (not null, default: '{}'::jsonb)
//   valor_hora_snapshot: numeric (not null, default: 0)
//   valor_diaria_snapshot: numeric (not null, default: 0)
//   email: text (not null)
//   telefone: text (nullable)
//   endereco: jsonb (not null, default: '{}'::jsonb)
//   assinatura_url: text (nullable)
//   dados_dinamicos: jsonb (nullable)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: configuracao_usuario
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   notificacoes_email: boolean (not null, default: true)
//   notificacoes_push: boolean (not null, default: true)
//   assinatura_padrao_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: documento_anexo
//   id: uuid (not null, default: gen_random_uuid())
//   documento_id: uuid (not null)
//   arquivo_url: text (not null)
//   tipo_anexo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: documento_gerado
//   id: uuid (not null, default: gen_random_uuid())
//   modelo_id: uuid (not null)
//   modelo_versao_id: uuid (not null)
//   empresa_id: uuid (not null)
//   cargo_id: uuid (nullable)
//   colaborador_id: uuid (nullable)
//   titulo: text (not null)
//   tipo_documento: text (not null)
//   status: text (not null)
//   versao_atual: integer (not null, default: 1)
//   arquivo_pdf_url: text (nullable)
//   arquivo_renderizado_url: text (nullable)
//   dados_preenchidos: jsonb (not null, default: '{}'::jsonb)
//   responsavel_empresa_nome: text (nullable)
//   responsavel_empresa_assinatura_url: text (nullable)
//   testemunha_1_nome: text (nullable)
//   testemunha_1_cpf: text (nullable)
//   testemunha_1_assinatura_url: text (nullable)
//   testemunha_2_nome: text (nullable)
//   testemunha_2_cpf: text (nullable)
//   testemunha_2_assinatura_url: text (nullable)
//   assinatura_colaborador_url: text (nullable)
//   campos_editaveis_pdf: jsonb (not null, default: '{}'::jsonb)
//   created_by: uuid (not null)
//   updated_by: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: documento_versao
//   id: uuid (not null, default: gen_random_uuid())
//   documento_id: uuid (not null)
//   versao: integer (not null)
//   arquivo_pdf_url: text (not null)
//   dados_snapshot: jsonb (not null, default: '{}'::jsonb)
//   alterado_por_usuario_id: uuid (not null)
//   motivo_alteracao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: draft_manuals
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   state: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: draft_proposals
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   state: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: email_templates
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   titulo: text (not null)
//   assunto: text (not null)
//   conteudo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: email_tracking
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   followup_id: uuid (nullable)
//   token: uuid (not null, default: gen_random_uuid())
//   assunto: text (not null)
//   enviado_em: timestamp with time zone (not null, default: now())
//   aberto_em: timestamp with time zone (nullable)
//   aberto: boolean (not null, default: false)
//   total_aberturas: integer (not null, default: 0)
//   status: text (not null, default: 'enviado'::text)
//   erro_mensagem: text (nullable)
//   notificacao_vista: boolean (not null, default: false)
//   proposal_id: uuid (nullable)
// Table: employee_documents
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   document_type: text (not null)
//   expiry_date: date (nullable)
//   status: text (not null, default: 'up-to-date'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   file_url: text (nullable)
// Table: employees
//   id: uuid (not null, default: gen_random_uuid())
//   company: text (not null)
//   name: text (not null)
//   cpf: text (nullable)
//   birth_date: date (nullable)
//   contract_type: text (not null, default: 'CLT'::text)
//   role: text (not null)
//   status: text (not null, default: 'ativo'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   email: text (nullable)
//   address: text (nullable)
//   rg: text (nullable)
//   cnpj: text (nullable)
//   admission_date: date (nullable)
//   observations: text (nullable)
//   phone: text (nullable)
//   cep: text (nullable)
//   logradouro: text (nullable)
//   numero: text (nullable)
//   complemento: text (nullable)
//   bairro: text (nullable)
//   cidade: text (nullable)
//   uf: text (nullable)
//   company_name: text (nullable)
//   user_id: uuid (nullable)
//   invite_status: text (nullable, default: 'Não Convidado'::text)
//   role_id: uuid (nullable)
// Table: empresa_contratante
//   id: uuid (not null, default: gen_random_uuid())
//   razao_social: text (not null)
//   nome_fantasia: text (not null)
//   cnpj: text (not null)
//   inscricao_estadual: text (nullable)
//   endereco: jsonb (not null, default: '{}'::jsonb)
//   logo_url: text (nullable)
//   header_template: jsonb (not null, default: '{}'::jsonb)
//   nome_responsavel: text (not null)
//   cpf_responsavel: text (not null)
//   assinatura_responsavel_url: text (nullable)
//   ativa: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   inscricao_municipal: text (nullable)
// Table: followup_roteiro
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   dia_sequencia: integer (not null)
//   tipo: text (not null)
//   descricao: text (not null)
//   data_prevista: date (not null)
//   concluido: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   observacoes: text (nullable)
// Table: followups
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   tipo: text (not null)
//   data_prevista: timestamp with time zone (not null)
//   concluido: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   observacoes: text (nullable)
// Table: general_settings
//   id: uuid (not null, default: gen_random_uuid())
//   condicoes_pagamento: text (nullable, default: ''::text)
//   observacoes: text (nullable, default: ''::text)
//   clausulas: text (nullable, default: ''::text)
//   condicoes_gerais: text (nullable, default: ''::text)
//   garantia: text (nullable, default: ''::text)
//   banco_imagens: jsonb (nullable, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   manual_caracteristicas: text (nullable, default: ''::text)
//   manual_cuidados: text (nullable, default: ''::text)
//   manual_conclusao: text (nullable, default: ''::text)
// Table: gmail_tokens
//   user_id: uuid (not null)
//   access_token: text (not null)
//   refresh_token: text (nullable)
//   expires_at: bigint (not null)
//   email: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: historico_comunicacao
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   remetente: text (not null)
//   destinatario: text (not null)
//   assunto: text (not null)
//   conteudo: text (not null)
//   tipo: text (not null)
//   data_comunicacao: timestamp with time zone (nullable, default: now())
//   gmail_message_id: text (nullable)
//   user_id: uuid (nullable)
// Table: historico_etapas
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   etapa: text (not null)
//   data_entrada: timestamp with time zone (not null, default: now())
//   data_saida: timestamp with time zone (nullable)
//   user_id: uuid (nullable)
// Table: hr_document_templates
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   category: text (not null)
//   content: text (not null)
//   company: text (not null)
//   version: integer (not null, default: 1)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: hr_generated_documents
//   id: uuid (not null, default: gen_random_uuid())
//   template_id: uuid (nullable)
//   employee_id: uuid (nullable)
//   title: text (not null)
//   content: text (not null)
//   status: text (not null, default: 'Gerado'::text)
//   pdf_url: text (nullable)
//   company: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: hr_profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (not null)
//   role: text (not null, default: 'NovoUsuario'::text)
//   company: text (not null, default: 'Primer Pisos'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   avatar_url: text (nullable)
//   cpf: text (nullable)
//   signature_url: text (nullable)
// Table: hr_roles
//   id: uuid (not null, default: gen_random_uuid())
//   company: text (not null)
//   name: text (not null)
//   hourly_rate: numeric (not null, default: 0)
//   daily_rate: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: image_bank
//   id: uuid (not null, default: gen_random_uuid())
//   url: text (not null)
//   client_name: text (not null)
//   revestimento_id: uuid (nullable)
//   industria_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   folder_id: uuid (nullable)
//   tags: jsonb (nullable, default: '[]'::jsonb)
// Table: image_folders
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: image_industrias
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: image_revestimentos
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   empresa: text (not null)
//   contato: text (not null)
//   telefone: text (nullable)
//   email: text (nullable)
//   data_entrada: timestamp with time zone (nullable, default: now())
//   etapa: text (not null, default: 'novo'::text)
//   valor_proposta: numeric (nullable)
//   tipo_revestimento: text (nullable)
//   area_m2: numeric (nullable)
//   temperatura: text (nullable)
//   user_id: uuid (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   responsavel: text (nullable)
//   origem: text (nullable)
//   vendedor_id: uuid (nullable)
//   motivo_perda: text (nullable)
//   observacoes: text (nullable)
//   updated_at: timestamp with time zone (nullable, default: now())
//   logo_url: text (nullable)
//   cpf_cnpj: text (nullable)
//   cnpj_cpf: text (nullable, default: ''::text)
//   cep: text (nullable)
//   logradouro: text (nullable)
//   numero: text (nullable)
//   complemento: text (nullable)
//   bairro: text (nullable)
//   cidade: text (nullable)
//   uf: text (nullable)
//   numero_proposta: text (nullable)
//   visita_data: timestamp with time zone (nullable)
//   visita_relato: text (nullable)
//   visita_status: text (nullable)
//   visita_vendedor_id: uuid (nullable)
// Table: modelo
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (nullable)
//   tipo_documento: text (not null)
//   nome: text (not null)
//   descricao: text (nullable)
//   versao_atual: integer (not null, default: 1)
//   arquivo_original_url: text (not null)
//   campos_config: jsonb (not null, default: '{}'::jsonb)
//   placeholders: jsonb (not null, default: '{}'::jsonb)
//   regras_autopreenchimento: jsonb (not null, default: '{}'::jsonb)
//   regras_assinatura: jsonb (not null, default: '{}'::jsonb)
//   campos_editaveis_pdf: jsonb (not null, default: '{}'::jsonb)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: modelo_versao
//   id: uuid (not null, default: gen_random_uuid())
//   modelo_id: uuid (not null)
//   versao: integer (not null)
//   arquivo_url: text (not null)
//   campos_config_snapshot: jsonb (not null, default: '{}'::jsonb)
//   alterado_por_usuario_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: motivos_perda
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   nome: text (not null)
//   descricao: text (nullable)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: photo_templates
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   name: text (not null)
//   photos: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pipeline_stages
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   nome: text (not null)
//   ordem: integer (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: proposal_photos
//   id: uuid (not null, default: gen_random_uuid())
//   url: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: proposals
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   numero: text (not null)
//   cliente: text (not null)
//   data: text (not null)
//   local: text (not null)
//   celular: text (nullable)
//   email: text (nullable)
//   status: text (not null, default: 'Rascunho'::text)
//   state: jsonb (not null, default: '{}'::jsonb)
//   imagem: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   arquivado: boolean (not null, default: false)
// Table: tax_settings
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   percentage: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   items: jsonb (nullable, default: '[]'::jsonb)
//   observation: text (nullable)
// Table: time_tracks
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   track_date: date (not null)
//   in1: time without time zone (nullable)
//   out1: time without time zone (nullable)
//   in2: time without time zone (nullable)
//   out2: time without time zone (nullable)
//   total_hours: numeric (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_settings
//   user_id: uuid (not null)
//   configuracoes_temperatura: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   configuracoes_alertas: jsonb (nullable, default: '{"dias_inatividade_frio": 30, "dias_inatividade_morno": 15, "dias_inatividade_quente": 5, "mensagem_alerta_customizada": "Atenção: Este lead não recebe contato há muito tempo. Agende um follow-up para retomá-lo."}'::jsonb)
//   configuracoes_marketing: jsonb (nullable, default: '{"enabled": false, "triggers": {"on_lead_created": true, "on_stage_changed": true, "on_temperature_changed": true}, "webhook_url": ""}'::jsonb)
//   logo_url: text (nullable)
//   configuracoes_relatorios: jsonb (nullable, default: '{"tabs": [{"id": "atividades", "label": "Atividades Concluídas", "order": 0, "visible": true}, {"id": "emails", "label": "E-mails", "order": 1, "visible": true}, {"id": "progresso", "label": "Progresso de Negócios", "order": 2, "visible": true}, {"id": "duracao", "label": "Duração de Negócios", "order": 3, "visible": true}, {"id": "conversao", "label": "Conversão", "order": 4, "visible": true}, {"id": "ganhos", "label": "Negócios Ganhos", "order": 5, "visible": true}, {"id": "valor", "label": "Valor Médio", "order": 6, "visible": true}, {"id": "servicos", "label": "Serviços Vendidos", "order": 7, "visible": true}, {"id": "visitas", "label": "Visitas", "order": 8, "visible": true}], "schedule": null}'::jsonb)
//   configuracoes_tabela: jsonb (nullable, default: '{"email": true, "etapa": true, "contato": true, "empresa": true, "data_entrada": true, "ultimo_email": true}'::jsonb)
//   assinatura_html: text (nullable)
//   logo_width: integer (nullable, default: 200)
//   website_url: text (nullable, default: 'https://www.primerpisos.com.br'::text)
//   instagram_url: text (nullable)
//   assinatura_imagem_url: text (nullable)
//   configuracoes_numeracao: jsonb (nullable, default: '{"ano_vigente": null, "proximo_numero": null}'::jsonb)
//   configuracoes_whatsapp: jsonb (nullable, default: '{"api_url": "", "enabled": false, "api_token": ""}'::jsonb)
// Table: usuario_sistema
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   nome_completo: text (not null)
//   cpf: text (not null)
//   tipo_usuario: text (not null)
//   senha_hash: text (not null)
//   assinatura_url: text (nullable)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: vendedores
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   telefone: text (nullable)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   foto_url: text (nullable)
//   role: text (not null, default: 'user'::text)
//   cpf: text (nullable)
//   assinatura_url: text (nullable)
//   cargo: text (nullable)
// Table: whatsapp_templates
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   titulo: text (not null)
//   conteudo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: work_scales
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   period: text (not null)
//   schedule: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: auditoria_documento
//   CHECK auditoria_documento_acao_check: CHECK ((acao = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text, 'clone'::text, 'export'::text, 'approve'::text, 'login'::text, 'upload_assinatura'::text])))
//   PRIMARY KEY auditoria_documento_pkey: PRIMARY KEY (id)
//   FOREIGN KEY auditoria_documento_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuario_sistema(id) ON DELETE RESTRICT
// Table: campo_modelo
//   CHECK campo_modelo_fonte_dado_check: CHECK ((fonte_dado = ANY (ARRAY['manual'::text, 'colaborador'::text, 'cargo'::text, 'empresa'::text, 'calculado'::text])))
//   FOREIGN KEY campo_modelo_modelo_id_fkey: FOREIGN KEY (modelo_id) REFERENCES modelo(id) ON DELETE CASCADE
//   PRIMARY KEY campo_modelo_pkey: PRIMARY KEY (id)
//   CHECK campo_modelo_tipo_check: CHECK ((tipo = ANY (ARRAY['text'::text, 'date'::text, 'number'::text, 'select'::text, 'rich_text'::text, 'boolean'::text, 'signature'::text])))
// Table: cargo
//   FOREIGN KEY cargo_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresa_contratante(id) ON DELETE CASCADE
//   PRIMARY KEY cargo_pkey: PRIMARY KEY (id)
// Table: catalog_items
//   FOREIGN KEY catalog_items_acabamento_id_fkey: FOREIGN KEY (acabamento_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_aplicacao_id_fkey: FOREIGN KEY (aplicacao_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_diversos_id_fkey: FOREIGN KEY (diversos_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_estucamento_id_fkey: FOREIGN KEY (estucamento_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_mobilizacao_id_fkey: FOREIGN KEY (mobilizacao_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   PRIMARY KEY catalog_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY catalog_items_preparacao_id_fkey: FOREIGN KEY (preparacao_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_primer_id_fkey: FOREIGN KEY (primer_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_regularizacao_id_fkey: FOREIGN KEY (regularizacao_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
//   FOREIGN KEY catalog_items_utilizacao_id_fkey: FOREIGN KEY (utilizacao_id) REFERENCES catalog_stages(id) ON DELETE SET NULL
// Table: catalog_stages
//   PRIMARY KEY catalog_stages_pkey: PRIMARY KEY (id)
// Table: colaborador
//   FOREIGN KEY colaborador_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargo(id) ON DELETE RESTRICT
//   FOREIGN KEY colaborador_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresa_contratante(id) ON DELETE CASCADE
//   PRIMARY KEY colaborador_pkey: PRIMARY KEY (id)
//   CHECK colaborador_tipo_colaborador_check: CHECK ((tipo_colaborador = ANY (ARRAY['PF'::text, 'MEI'::text])))
// Table: configuracao_usuario
//   PRIMARY KEY configuracao_usuario_pkey: PRIMARY KEY (id)
//   FOREIGN KEY configuracao_usuario_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuario_sistema(id) ON DELETE CASCADE
// Table: documento_anexo
//   FOREIGN KEY documento_anexo_documento_id_fkey: FOREIGN KEY (documento_id) REFERENCES documento_gerado(id) ON DELETE CASCADE
//   PRIMARY KEY documento_anexo_pkey: PRIMARY KEY (id)
// Table: documento_gerado
//   FOREIGN KEY documento_gerado_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargo(id) ON DELETE SET NULL
//   FOREIGN KEY documento_gerado_colaborador_id_fkey: FOREIGN KEY (colaborador_id) REFERENCES colaborador(id) ON DELETE SET NULL
//   FOREIGN KEY documento_gerado_created_by_fkey: FOREIGN KEY (created_by) REFERENCES usuario_sistema(id) ON DELETE RESTRICT
//   FOREIGN KEY documento_gerado_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresa_contratante(id) ON DELETE RESTRICT
//   FOREIGN KEY documento_gerado_modelo_id_fkey: FOREIGN KEY (modelo_id) REFERENCES modelo(id) ON DELETE RESTRICT
//   FOREIGN KEY documento_gerado_modelo_versao_id_fkey: FOREIGN KEY (modelo_versao_id) REFERENCES modelo_versao(id) ON DELETE RESTRICT
//   PRIMARY KEY documento_gerado_pkey: PRIMARY KEY (id)
//   CHECK documento_gerado_status_check: CHECK ((status = ANY (ARRAY['rascunho'::text, 'finalizado'::text, 'arquivado'::text])))
//   CHECK documento_gerado_tipo_documento_check: CHECK ((tipo_documento = ANY (ARRAY['Contrato'::text, 'OrdemServico'::text, 'NR'::text])))
//   FOREIGN KEY documento_gerado_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES usuario_sistema(id) ON DELETE SET NULL
// Table: documento_versao
//   FOREIGN KEY documento_versao_alterado_por_usuario_id_fkey: FOREIGN KEY (alterado_por_usuario_id) REFERENCES usuario_sistema(id) ON DELETE RESTRICT
//   FOREIGN KEY documento_versao_documento_id_fkey: FOREIGN KEY (documento_id) REFERENCES documento_gerado(id) ON DELETE CASCADE
//   PRIMARY KEY documento_versao_pkey: PRIMARY KEY (id)
// Table: draft_manuals
//   PRIMARY KEY draft_manuals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY draft_manuals_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE draft_manuals_user_id_key: UNIQUE (user_id)
// Table: draft_proposals
//   PRIMARY KEY draft_proposals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY draft_proposals_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE draft_proposals_user_id_key: UNIQUE (user_id)
// Table: email_templates
//   PRIMARY KEY email_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY email_templates_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: email_tracking
//   FOREIGN KEY email_tracking_followup_id_fkey: FOREIGN KEY (followup_id) REFERENCES followups(id) ON DELETE SET NULL
//   FOREIGN KEY email_tracking_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY email_tracking_pkey: PRIMARY KEY (id)
//   FOREIGN KEY email_tracking_proposal_id_fkey: FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
//   UNIQUE email_tracking_token_key: UNIQUE (token)
// Table: employee_documents
//   FOREIGN KEY employee_documents_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY employee_documents_pkey: PRIMARY KEY (id)
// Table: employees
//   PRIMARY KEY employees_pkey: PRIMARY KEY (id)
//   FOREIGN KEY employees_role_id_fkey: FOREIGN KEY (role_id) REFERENCES hr_roles(id) ON DELETE SET NULL
//   FOREIGN KEY employees_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: empresa_contratante
//   PRIMARY KEY empresa_contratante_pkey: PRIMARY KEY (id)
// Table: followup_roteiro
//   FOREIGN KEY followup_roteiro_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY followup_roteiro_pkey: PRIMARY KEY (id)
//   CHECK followup_roteiro_tipo_check: CHECK ((tipo = ANY (ARRAY['whatsapp'::text, 'email'::text, 'ligacao'::text])))
// Table: followups
//   FOREIGN KEY followups_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY followups_pkey: PRIMARY KEY (id)
// Table: general_settings
//   PRIMARY KEY general_settings_pkey: PRIMARY KEY (id)
// Table: gmail_tokens
//   PRIMARY KEY gmail_tokens_pkey: PRIMARY KEY (user_id)
//   FOREIGN KEY gmail_tokens_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: historico_comunicacao
//   FOREIGN KEY historico_comunicacao_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY historico_comunicacao_pkey: PRIMARY KEY (id)
//   CHECK historico_comunicacao_tipo_check: CHECK ((tipo = ANY (ARRAY['enviado'::text, 'recebido'::text])))
//   FOREIGN KEY historico_comunicacao_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: historico_etapas
//   FOREIGN KEY historico_etapas_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY historico_etapas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_etapas_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: hr_document_templates
//   PRIMARY KEY hr_document_templates_pkey: PRIMARY KEY (id)
// Table: hr_generated_documents
//   FOREIGN KEY hr_generated_documents_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY hr_generated_documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY hr_generated_documents_template_id_fkey: FOREIGN KEY (template_id) REFERENCES hr_document_templates(id) ON DELETE SET NULL
// Table: hr_profiles
//   FOREIGN KEY hr_profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY hr_profiles_pkey: PRIMARY KEY (id)
// Table: hr_roles
//   PRIMARY KEY hr_roles_pkey: PRIMARY KEY (id)
// Table: image_bank
//   FOREIGN KEY image_bank_folder_id_fkey: FOREIGN KEY (folder_id) REFERENCES image_folders(id) ON DELETE SET NULL
//   FOREIGN KEY image_bank_industria_id_fkey: FOREIGN KEY (industria_id) REFERENCES image_industrias(id) ON DELETE SET NULL
//   PRIMARY KEY image_bank_pkey: PRIMARY KEY (id)
//   FOREIGN KEY image_bank_revestimento_id_fkey: FOREIGN KEY (revestimento_id) REFERENCES image_revestimentos(id) ON DELETE SET NULL
// Table: image_folders
//   PRIMARY KEY image_folders_pkey: PRIMARY KEY (id)
// Table: image_industrias
//   PRIMARY KEY image_industrias_pkey: PRIMARY KEY (id)
// Table: image_revestimentos
//   PRIMARY KEY image_revestimentos_pkey: PRIMARY KEY (id)
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY leads_vendedor_id_fkey: FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL
//   FOREIGN KEY leads_visita_vendedor_id_fkey: FOREIGN KEY (visita_vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL
// Table: modelo
//   FOREIGN KEY modelo_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresa_contratante(id) ON DELETE SET NULL
//   PRIMARY KEY modelo_pkey: PRIMARY KEY (id)
//   CHECK modelo_tipo_documento_check: CHECK ((tipo_documento = ANY (ARRAY['Contrato'::text, 'OrdemServico'::text, 'NR'::text])))
// Table: modelo_versao
//   FOREIGN KEY modelo_versao_alterado_por_usuario_id_fkey: FOREIGN KEY (alterado_por_usuario_id) REFERENCES usuario_sistema(id) ON DELETE RESTRICT
//   FOREIGN KEY modelo_versao_modelo_id_fkey: FOREIGN KEY (modelo_id) REFERENCES modelo(id) ON DELETE CASCADE
//   PRIMARY KEY modelo_versao_pkey: PRIMARY KEY (id)
// Table: motivos_perda
//   PRIMARY KEY motivos_perda_pkey: PRIMARY KEY (id)
//   FOREIGN KEY motivos_perda_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: photo_templates
//   PRIMARY KEY photo_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY photo_templates_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pipeline_stages
//   PRIMARY KEY pipeline_stages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pipeline_stages_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: proposal_photos
//   PRIMARY KEY proposal_photos_pkey: PRIMARY KEY (id)
// Table: proposals
//   PRIMARY KEY proposals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY proposals_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: tax_settings
//   PRIMARY KEY tax_settings_pkey: PRIMARY KEY (id)
// Table: time_tracks
//   FOREIGN KEY time_tracks_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY time_tracks_pkey: PRIMARY KEY (id)
// Table: user_settings
//   PRIMARY KEY user_settings_pkey: PRIMARY KEY (user_id)
//   FOREIGN KEY user_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: usuario_sistema
//   PRIMARY KEY usuario_sistema_pkey: PRIMARY KEY (id)
//   CHECK usuario_sistema_tipo_usuario_check: CHECK ((tipo_usuario = ANY (ARRAY['Admin'::text, 'Coordenadora'::text, 'NovoUsuario'::text, 'Colaborador'::text, 'Encarregado'::text, 'Usuario'::text])))
// Table: vendedores
//   PRIMARY KEY vendedores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY vendedores_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: whatsapp_templates
//   PRIMARY KEY whatsapp_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY whatsapp_templates_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: work_scales
//   FOREIGN KEY work_scales_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   UNIQUE work_scales_employee_id_period_key: UNIQUE (employee_id, period)
//   PRIMARY KEY work_scales_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: auditoria_documento
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: campo_modelo
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cargo
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: catalog_items
//   Policy "authenticated_all_catalog_items" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: catalog_stages
//   Policy "authenticated_all_catalog_stages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: colaborador
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: configuracao_usuario
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documento_anexo
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documento_gerado
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documento_versao
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: draft_manuals
//   Policy "draft_manuals_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id IN ( SELECT get_workspace_users() AS get_workspace_users))
//     WITH CHECK: (user_id IN ( SELECT get_workspace_users() AS get_workspace_users))
// Table: draft_proposals
//   Policy "draft_proposals_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id IN ( SELECT get_workspace_users() AS get_workspace_users))
//     WITH CHECK: (user_id IN ( SELECT get_workspace_users() AS get_workspace_users))
// Table: email_templates
//   Policy "email_templates_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
// Table: email_tracking
//   Policy "email_tracking_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: (((lead_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = email_tracking.lead_id)))) OR ((proposal_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM proposals   WHERE (proposals.id = email_tracking.proposal_id)))))
//     WITH CHECK: (((lead_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = email_tracking.lead_id)))) OR ((proposal_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM proposals   WHERE (proposals.id = email_tracking.proposal_id)))))
// Table: employee_documents
//   Policy "employee_documents_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: employees
//   Policy "employees_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: empresa_contratante
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: followup_roteiro
//   Policy "Users can manage workspace followup_roteiro" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followup_roteiro.lead_id)))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followup_roteiro.lead_id)))
//   Policy "Workspace access for followup_roteiro" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followup_roteiro.lead_id)))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followup_roteiro.lead_id)))
// Table: followups
//   Policy "Users can manage workspace followups" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followups.lead_id)))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followups.lead_id)))
//   Policy "Workspace access for followups" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followups.lead_id)))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = followups.lead_id)))
// Table: general_settings
//   Policy "authenticated_all_general_settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: gmail_tokens
//   Policy "Admin ALL gmail_tokens" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "User SELECT gmail_tokens" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: historico_comunicacao
//   Policy "historico_comunicacao_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE ((leads.id = historico_comunicacao.lead_id) AND ((leads.user_id = auth.uid()) OR (leads.user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces))))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE ((leads.id = historico_comunicacao.lead_id) AND ((leads.user_id = auth.uid()) OR (leads.user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces))))))
// Table: historico_etapas
//   Policy "Users can manage workspace historico" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = historico_etapas.lead_id)))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = historico_etapas.lead_id)))
//   Policy "Workspace access for historico_etapas" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = historico_etapas.lead_id)))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads   WHERE (leads.id = historico_etapas.lead_id)))
// Table: hr_document_templates
//   Policy "hr_document_templates_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: hr_generated_documents
//   Policy "hr_generated_documents_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: hr_profiles
//   Policy "hr_profiles_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: hr_roles
//   Policy "authenticated_all_hr_roles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: image_bank
//   Policy "authenticated_all_bank" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_image_bank" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: image_folders
//   Policy "authenticated_all_folders" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: image_industrias
//   Policy "authenticated_all_ind" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: image_revestimentos
//   Policy "authenticated_all_revest" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: leads
//   Policy "leads_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
// Table: modelo
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: modelo_versao
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: motivos_perda
//   Policy "motivos_perda_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
// Table: photo_templates
//   Policy "photo_templates_all" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//   Policy "public_read_photo_templates" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: pipeline_stages
//   Policy "pipeline_stages_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
// Table: proposal_photos
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: proposals
//   Policy "proposals_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: (user_id IN ( SELECT get_workspace_users() AS get_workspace_users))
//     WITH CHECK: (user_id IN ( SELECT get_workspace_users() AS get_workspace_users))
//   Policy "public_read_proposals" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: tax_settings
//   Policy "authenticated_all_tax_settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: time_tracks
//   Policy "time_tracks_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: user_settings
//   Policy "public_read_user_settings" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "user_settings_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
// Table: usuario_sistema
//   Policy "authenticated_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: vendedores
//   Policy "Admin ALL" (ALL, PERMISSIVE) roles={public}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "User SELECT all in workspace" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces))
//   Policy "User UPDATE own" (UPDATE, PERMISSIVE) roles={public}
//     USING: (email = (auth.jwt() ->> 'email'::text))
//     WITH CHECK: (email = (auth.jwt() ->> 'email'::text))
//   Policy "public_read_vendedores" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: whatsapp_templates
//   Policy "whatsapp_templates_all_workspace" (ALL, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
//     WITH CHECK: ((auth.uid() = user_id) OR (user_id IN ( SELECT get_auth_user_workspaces() AS get_auth_user_workspaces)))
// Table: work_scales
//   Policy "work_scales_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION format_phone_number(text)
//   CREATE OR REPLACE FUNCTION public.format_phone_number(p_phone text)
//    RETURNS text
//    LANGUAGE plpgsql
//    STABLE
//   AS $function$
//   DECLARE
//     v_digits text;
//   BEGIN
//     IF p_phone IS NULL OR p_phone = '' THEN
//       RETURN p_phone;
//     END IF;
//
//     v_digits := regexp_replace(p_phone, '\D', '', 'g');
//
//     IF length(v_digits) = 11 THEN
//       RETURN '(' || substr(v_digits, 1, 2) || ') ' || substr(v_digits, 3, 5) || '-' || substr(v_digits, 8, 4);
//     ELSIF length(v_digits) = 10 THEN
//       RETURN '(' || substr(v_digits, 1, 2) || ') ' || substr(v_digits, 3, 4) || '-' || substr(v_digits, 7, 4);
//     ELSE
//       -- Leave as is if it doesn't have 10 or 11 numeric digits
//       RETURN p_phone;
//     END IF;
//   END;
//   $function$
//
// FUNCTION get_auth_user_workspaces()
//   CREATE OR REPLACE FUNCTION public.get_auth_user_workspaces()
//    RETURNS SETOF uuid
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT user_id FROM public.vendedores
//     WHERE email = auth.jwt()->>'email' AND ativo = true;
//   $function$
//
// FUNCTION get_workspace_users()
//   CREATE OR REPLACE FUNCTION public.get_workspace_users()
//    RETURNS SETOF uuid
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     -- 1. My own ID
//     SELECT auth.uid()
//     UNION
//     -- 2. The workspace owner IDs for workspaces I am a vendor in
//     SELECT user_id FROM public.vendedores WHERE email = auth.jwt()->>'email' AND ativo = true
//     UNION
//     -- 3. Other vendors' auth IDs in the workspaces I am a vendor in, or workspaces I own
//     SELECT au.id
//     FROM auth.users au
//     JOIN public.vendedores v ON au.email = v.email
//     WHERE (
//       v.user_id IN (SELECT user_id FROM public.vendedores WHERE email = auth.jwt()->>'email' AND ativo = true)
//       OR v.user_id = auth.uid()
//     ) AND v.ativo = true;
//   $function$
//
// FUNCTION handle_email_followup_completed()
//   CREATE OR REPLACE FUNCTION public.handle_email_followup_completed()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.tipo = 'email' AND NEW.concluido = true AND OLD.concluido IS DISTINCT FROM true THEN
//           -- Only insert if there isn't already a tracking record for this followup
//           IF NOT EXISTS (SELECT 1 FROM public.email_tracking WHERE followup_id = NEW.id) THEN
//               INSERT INTO public.email_tracking (lead_id, followup_id, assunto)
//               VALUES (NEW.lead_id, NEW.id, 'Follow-up de E-mail (Automático)');
//           END IF;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_email_opened()
//   CREATE OR REPLACE FUNCTION public.handle_email_opened()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_lead_etapa text;
//       v_lead_user_id uuid;
//       v_novo_lead_id text;
//       v_contato_feito_id text;
//   BEGIN
//       -- Check if it transitioned from false to true
//       IF NEW.aberto = true AND (OLD.aberto IS NULL OR OLD.aberto = false) THEN
//
//           -- Get the lead's current stage and user_id
//           SELECT etapa, user_id INTO v_lead_etapa, v_lead_user_id FROM public.leads WHERE id = NEW.lead_id;
//
//           IF v_lead_user_id IS NOT NULL THEN
//               -- Get ID for the first stage (ordem = 0)
//               SELECT id INTO v_novo_lead_id FROM public.pipeline_stages
//               WHERE user_id = v_lead_user_id AND ordem = 0 LIMIT 1;
//
//               -- Get ID for the second stage (ordem = 1)
//               SELECT id INTO v_contato_feito_id FROM public.pipeline_stages
//               WHERE user_id = v_lead_user_id AND ordem = 1 LIMIT 1;
//
//               -- Move if current stage is the first stage and second stage exists
//               IF v_lead_etapa = v_novo_lead_id AND v_contato_feito_id IS NOT NULL THEN
//                   -- Close current history
//                   UPDATE public.historico_etapas
//                   SET data_saida = NOW()
//                   WHERE lead_id = NEW.lead_id AND data_saida IS NULL;
//
//                   -- Insert new history
//                   INSERT INTO public.historico_etapas (lead_id, etapa, data_entrada)
//                   VALUES (NEW.lead_id, v_contato_feito_id, NOW());
//
//                   -- Update lead
//                   UPDATE public.leads
//                   SET etapa = v_contato_feito_id, updated_at = NOW()
//                   WHERE id = NEW.lead_id;
//               END IF;
//           END IF;
//
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_historico_comunicacao_inserted()
//   CREATE OR REPLACE FUNCTION public.handle_historico_comunicacao_inserted()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_lead_etapa text;
//       v_lead_user_id uuid;
//       v_novo_lead_id text;
//       v_contato_feito_id text;
//   BEGIN
//       SELECT etapa, user_id INTO v_lead_etapa, v_lead_user_id FROM public.leads WHERE id = NEW.lead_id;
//
//       IF v_lead_user_id IS NOT NULL THEN
//           SELECT id INTO v_novo_lead_id FROM public.pipeline_stages
//           WHERE user_id = v_lead_user_id AND ordem = 0 LIMIT 1;
//
//           SELECT id INTO v_contato_feito_id FROM public.pipeline_stages
//           WHERE user_id = v_lead_user_id AND ordem = 1 LIMIT 1;
//
//           IF v_lead_etapa = v_novo_lead_id AND v_contato_feito_id IS NOT NULL THEN
//               UPDATE public.historico_etapas
//               SET data_saida = NOW()
//               WHERE lead_id = NEW.lead_id AND data_saida IS NULL;
//
//               INSERT INTO public.historico_etapas (lead_id, etapa, data_entrada)
//               VALUES (NEW.lead_id, v_contato_feito_id, NOW());
//
//               UPDATE public.leads
//               SET etapa = v_contato_feito_id, updated_at = NOW()
//               WHERE id = NEW.lead_id;
//           END IF;
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_logical_delete_proposal()
//   CREATE OR REPLACE FUNCTION public.handle_logical_delete_proposal()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_novo_numero text;
//       v_lead_id uuid;
//       v_arquivado_stage_id uuid;
//   BEGIN
//       -- Se já estiver arquivada, permite a exclusão definitiva (Hard Delete)
//       IF OLD.arquivado = true THEN
//           RETURN OLD;
//       END IF;
//
//       -- Caso contrário, faz o soft delete (arquivamento)
//       v_novo_numero := CASE
//           WHEN OLD.numero NOT LIKE 'ARQ-%' THEN 'ARQ-' || OLD.numero
//           ELSE OLD.numero
//       END;
//
//       UPDATE public.proposals
//       SET
//         arquivado = true,
//         numero = v_novo_numero
//       WHERE id = OLD.id;
//
//       -- Atualizar o lead relacionado para a etapa 'Arquivado'
//       FOR v_lead_id IN
//           SELECT id FROM public.leads WHERE numero_proposta ILIKE '%' || OLD.numero || '%' AND user_id = OLD.user_id
//       LOOP
//           -- Buscar ou criar a etapa 'Arquivado'
//           SELECT id INTO v_arquivado_stage_id FROM public.pipeline_stages WHERE user_id = OLD.user_id AND nome ILIKE 'Arquivado' LIMIT 1;
//
//           IF v_arquivado_stage_id IS NULL THEN
//               INSERT INTO public.pipeline_stages (user_id, nome, ordem)
//               VALUES (OLD.user_id, 'Arquivado', 99)
//               RETURNING id INTO v_arquivado_stage_id;
//           END IF;
//
//           -- Mover o lead e atualizar o número da proposta nele
//           UPDATE public.leads
//           SET
//               etapa = v_arquivado_stage_id,
//               numero_proposta = replace(numero_proposta, OLD.numero, v_novo_numero),
//               updated_at = NOW()
//           WHERE id = v_lead_id;
//
//           -- Registrar no histórico de etapas
//           UPDATE public.historico_etapas SET data_saida = NOW() WHERE lead_id = v_lead_id AND data_saida IS NULL;
//           INSERT INTO public.historico_etapas (lead_id, etapa, data_entrada) VALUES (v_lead_id, v_arquivado_stage_id, NOW());
//       END LOOP;
//
//       RETURN NULL;
//   END;
//   $function$
//
// FUNCTION handle_new_hr_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_hr_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.hr_profiles (id, email, name)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_new_user_crm_setup()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_crm_setup()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_html text;
//   BEGIN
//       INSERT INTO public.pipeline_stages (user_id, nome, ordem) VALUES
//       (NEW.id, 'Novo Lead', 0),
//       (NEW.id, 'Contato Feito', 1),
//       (NEW.id, 'Proposta Enviada', 2),
//       (NEW.id, 'Negociação', 3),
//       (NEW.id, 'Fechado', 4),
//       (NEW.id, 'Perdido', 5);
//
//       v_html := '<div style="font-family: Arial, sans-serif; max-width: 600px; margin-top: 20px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="width: 140px; padding-right: 15px; vertical-align: middle; text-align: center;">{{logo_empresa}}</td><td style="border-left: 2px solid #006A9C; padding-left: 15px; vertical-align: middle;"><h3 style="margin: 0 0 2px 0; color: #006A9C; font-size: 16px; font-weight: bold; text-transform: uppercase;">{{vendedor_nome}}</h3><p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">{{vendedor_cargo}}</p><p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;">{{vendedor_telefone}}</p><table cellpadding="0" cellspacing="0" border="0" style="margin-top: 4px;"><tr><td style="padding-right: 10px;"><a href="{{website_url}}" target="_blank" style="text-decoration: none;"><img src="https://img.usecurling.com/i?q=globe&color=blue&shape=fill" width="22" height="22" alt="Site" style="display: block; border: none;" /></a></td><td>{{instagram_link_icon}}</td></tr></table></td></tr></table><div style="background-color: #f1f5f9; padding: 12px; margin-top: 15px; text-align: center; border-radius: 4px;"><p style="margin: 0; color: #334155; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Transformamos seu piso em alto padrão</p></div><div style="margin-top: 10px;">{{imagem_assinatura}}</div></div>';
//
//       INSERT INTO public.user_settings (user_id, assinatura_html, configuracoes_temperatura, configuracoes_alertas) VALUES
//       (NEW.id, v_html, '{
//           "hotMinProposalValue": 50000,
//           "warmMinProposalValue": 10000,
//           "hotMaxDaysWithoutContact": 3,
//           "warmMaxDaysWithoutContact": 15,
//           "stageTemperatures": {}
//       }'::jsonb, '{
//           "dias_inatividade_frio": 30,
//           "dias_inatividade_morno": 15,
//           "dias_inatividade_quente": 5,
//           "mensagem_alerta_customizada": "Atenção: Este lead não recebe contato há muito tempo. Agende um follow-up para retomá-lo."
//       }'::jsonb);
//
//       INSERT INTO public.motivos_perda (user_id, nome) VALUES
//       (NEW.id, 'Preço'),
//       (NEW.id, 'Concorrência'),
//       (NEW.id, 'Falta de Interesse'),
//       (NEW.id, 'Timing Inadequado'),
//       (NEW.id, 'Produto Inadequado'),
//       (NEW.id, 'Outros');
//
//       -- Insert default photo template with robust table layout
//       INSERT INTO public.email_templates (user_id, titulo, assunto, conteudo) VALUES
//       (NEW.id, 'Apresentação com Fotos (Otimizado)', 'Nossos Projetos Recentes', '<p>Olá,</p><p>Gostaríamos de compartilhar alguns de nossos projetos recentes para sua referência.</p><table cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; max-width: 600px; margin: 20px 0;"><tr><td align="center" style="text-align: center; padding: 5px;"><img src="https://img.usecurling.com/p/200/200?q=floor" width="180" style="display: block; width: 100%; max-width: 180px; border-radius: 4px;" alt="Projeto 1"/></td><td align="center" style="text-align: center; padding: 5px;"><img src="https://img.usecurling.com/p/200/200?q=epoxy" width="180" style="display: block; width: 100%; max-width: 180px; border-radius: 4px;" alt="Projeto 2"/></td><td align="center" style="text-align: center; padding: 5px;"><img src="https://img.usecurling.com/p/200/200?q=concrete" width="180" style="display: block; width: 100%; max-width: 180px; border-radius: 4px;" alt="Projeto 3"/></td></tr></table><p>Ficamos à disposição.</p>');
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_roteiro_email_completed()
//   CREATE OR REPLACE FUNCTION public.handle_roteiro_email_completed()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.tipo = 'email' AND NEW.concluido = true AND OLD.concluido IS DISTINCT FROM true THEN
//           INSERT INTO public.email_tracking (lead_id, assunto)
//           VALUES (NEW.lead_id, NEW.descricao);
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//       SELECT
//         -- Workspace owner is an admin
//         EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = auth.uid())
//         OR
//         -- Invited user with admin role
//         EXISTS (SELECT 1 FROM public.vendedores WHERE email = auth.jwt()->>'email' AND role = 'admin' AND ativo = true);
//     $function$
//
// FUNCTION merge_leads(uuid, uuid, jsonb)
//   CREATE OR REPLACE FUNCTION public.merge_leads(p_target_lead_id uuid, p_source_lead_id uuid, p_merged_data jsonb)
//    RETURNS void
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       v_target_created_at timestamptz;
//       v_source_created_at timestamptz;
//       v_oldest_created_at timestamptz;
//   BEGIN
//       -- Verify target lead exists and user has access (RLS applies)
//       SELECT created_at INTO v_target_created_at FROM public.leads WHERE id = p_target_lead_id;
//       IF v_target_created_at IS NULL THEN
//           RAISE EXCEPTION 'Target lead not found or not authorized.';
//       END IF;
//
//       -- Verify source lead exists and user has access (RLS applies)
//       SELECT created_at INTO v_source_created_at FROM public.leads WHERE id = p_source_lead_id;
//       IF v_source_created_at IS NULL THEN
//           RAISE EXCEPTION 'Source lead not found or not authorized.';
//       END IF;
//
//       -- Determine the oldest creation date to preserve history
//       IF v_source_created_at < v_target_created_at THEN
//           v_oldest_created_at := v_source_created_at;
//       ELSE
//           v_oldest_created_at := v_target_created_at;
//       END IF;
//
//       -- Update Target Lead with all fields from jsonb
//       -- We use COALESCE for required fields to prevent null constraint violations
//       UPDATE public.leads
//       SET
//           empresa = COALESCE((p_merged_data->>'empresa'), empresa),
//           contato = COALESCE((p_merged_data->>'contato'), contato),
//           telefone = p_merged_data->>'telefone',
//           email = p_merged_data->>'email',
//           cnpj_cpf = p_merged_data->>'cnpj_cpf',
//           valor_proposta = (p_merged_data->>'valor_proposta')::numeric,
//           tipo_revestimento = p_merged_data->>'tipo_revestimento',
//           area_m2 = (p_merged_data->>'area_m2')::numeric,
//           responsavel = p_merged_data->>'responsavel',
//           origem = p_merged_data->>'origem',
//           vendedor_id = NULLIF(p_merged_data->>'vendedor_id', '')::uuid,
//           observacoes = p_merged_data->>'observacoes',
//           logo_url = p_merged_data->>'logo_url',
//           cep = p_merged_data->>'cep',
//           logradouro = p_merged_data->>'logradouro',
//           numero = p_merged_data->>'numero',
//           complemento = p_merged_data->>'complemento',
//           bairro = p_merged_data->>'bairro',
//           cidade = p_merged_data->>'cidade',
//           uf = p_merged_data->>'uf',
//           numero_proposta = p_merged_data->>'numero_proposta',
//           created_at = v_oldest_created_at,
//           updated_at = NOW()
//       WHERE id = p_target_lead_id;
//
//       -- Reassign related records safely
//       UPDATE public.historico_comunicacao SET lead_id = p_target_lead_id WHERE lead_id = p_source_lead_id;
//       UPDATE public.historico_etapas SET lead_id = p_target_lead_id WHERE lead_id = p_source_lead_id;
//       UPDATE public.followups SET lead_id = p_target_lead_id WHERE lead_id = p_source_lead_id;
//       UPDATE public.followup_roteiro SET lead_id = p_target_lead_id WHERE lead_id = p_source_lead_id;
//       UPDATE public.email_tracking SET lead_id = p_target_lead_id WHERE lead_id = p_source_lead_id;
//
//       -- Delete Source Lead
//       DELETE FROM public.leads WHERE id = p_source_lead_id;
//   END;
//   $function$
//
// FUNCTION prevent_update_archived_proposal()
//   CREATE OR REPLACE FUNCTION public.prevent_update_archived_proposal()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Se a proposta já está arquivada e continua arquivada, impede outras atualizações
//     IF OLD.arquivado = true AND NEW.arquivado = true THEN
//       RETURN OLD;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION restrict_user_settings_update()
//   CREATE OR REPLACE FUNCTION public.restrict_user_settings_update()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//     BEGIN
//       IF NOT public.is_admin() THEN
//         IF NEW.logo_url IS DISTINCT FROM OLD.logo_url OR
//            NEW.logo_width IS DISTINCT FROM OLD.logo_width OR
//            NEW.website_url IS DISTINCT FROM OLD.website_url OR
//            NEW.instagram_url IS DISTINCT FROM OLD.instagram_url OR
//            NEW.configuracoes_marketing IS DISTINCT FROM OLD.configuracoes_marketing THEN
//            RAISE EXCEPTION 'Acesso negado: Apenas administradores podem alterar integrações e identidade visual.';
//         END IF;
//       END IF;
//       RETURN NEW;
//     END;
//     $function$
//
// FUNCTION restrict_vendedores_role_update()
//   CREATE OR REPLACE FUNCTION public.restrict_vendedores_role_update()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//     BEGIN
//       IF NOT public.is_admin() THEN
//         IF NEW.role IS DISTINCT FROM OLD.role OR NEW.ativo IS DISTINCT FROM OLD.ativo THEN
//           RAISE EXCEPTION 'Acesso negado: Você não pode alterar seu próprio nível de acesso ou status.';
//         END IF;
//       END IF;
//       RETURN NEW;
//     END;
//     $function$
//
// FUNCTION trigger_gerar_roteiro_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_gerar_roteiro_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     request_url text := 'https://peyrjidmhkwhxobpvpkj.supabase.co/functions/v1/gerar-roteiro-followup';
//     payload jsonb;
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       payload := jsonb_build_object(
//         'type', TG_OP,
//         'table', TG_TABLE_NAME,
//         'schema', TG_TABLE_SCHEMA,
//         'record', row_to_json(NEW),
//         'old_record', row_to_json(OLD)
//       );
//     ELSE
//       payload := jsonb_build_object(
//         'type', TG_OP,
//         'table', TG_TABLE_NAME,
//         'schema', TG_TABLE_SCHEMA,
//         'record', row_to_json(NEW),
//         'old_record', null
//       );
//     END IF;
//
//     PERFORM net.http_post(
//       url := request_url,
//       headers := '{"Content-Type": "application/json"}'::jsonb,
//       body := payload
//     );
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_marketing_webhook()
//   CREATE OR REPLACE FUNCTION public.trigger_marketing_webhook()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     request_url text := 'https://peyrjidmhkwhxobpvpkj.supabase.co/functions/v1/marketing-webhook-dispatcher';
//     payload jsonb;
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       -- Check if relevant fields changed
//       IF NEW.etapa IS NOT DISTINCT FROM OLD.etapa AND NEW.temperatura IS NOT DISTINCT FROM OLD.temperatura THEN
//         RETURN NEW;
//       END IF;
//
//       payload := jsonb_build_object(
//         'type', TG_OP,
//         'table', TG_TABLE_NAME,
//         'schema', TG_TABLE_SCHEMA,
//         'record', row_to_json(NEW),
//         'old_record', row_to_json(OLD)
//       );
//     ELSE
//       payload := jsonb_build_object(
//         'type', TG_OP,
//         'table', TG_TABLE_NAME,
//         'schema', TG_TABLE_SCHEMA,
//         'record', row_to_json(NEW),
//         'old_record', null
//       );
//     END IF;
//
//     PERFORM net.http_post(
//       url := request_url,
//       headers := '{"Content-Type": "application/json"}'::jsonb,
//       body := payload
//     );
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION update_leads_updated_at_column()
//   CREATE OR REPLACE FUNCTION public.update_leads_updated_at_column()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: email_tracking
//   on_email_opened: CREATE TRIGGER on_email_opened AFTER UPDATE OF aberto ON public.email_tracking FOR EACH ROW EXECUTE FUNCTION handle_email_opened()
// Table: followup_roteiro
//   on_followup_roteiro_updated_gerar_roteiro: CREATE TRIGGER on_followup_roteiro_updated_gerar_roteiro AFTER UPDATE OF concluido ON public.followup_roteiro FOR EACH ROW WHEN (((old.concluido = false) AND (new.concluido = true))) EXECUTE FUNCTION trigger_gerar_roteiro_webhook()
//   trigger_roteiro_email_completed: CREATE TRIGGER trigger_roteiro_email_completed AFTER UPDATE ON public.followup_roteiro FOR EACH ROW EXECUTE FUNCTION handle_roteiro_email_completed()
// Table: followups
//   trigger_email_followup_completed: CREATE TRIGGER trigger_email_followup_completed AFTER UPDATE ON public.followups FOR EACH ROW EXECUTE FUNCTION handle_email_followup_completed()
// Table: historico_comunicacao
//   on_historico_comunicacao_inserted: CREATE TRIGGER on_historico_comunicacao_inserted AFTER INSERT ON public.historico_comunicacao FOR EACH ROW EXECUTE FUNCTION handle_historico_comunicacao_inserted()
// Table: leads
//   on_lead_changes_marketing_webhook: CREATE TRIGGER on_lead_changes_marketing_webhook AFTER INSERT OR UPDATE OF etapa, temperatura ON public.leads FOR EACH ROW EXECUTE FUNCTION trigger_marketing_webhook()
//   on_lead_inserted_gerar_roteiro: CREATE TRIGGER on_lead_inserted_gerar_roteiro AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION trigger_gerar_roteiro_webhook()
//   update_leads_updated_at: CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at_column()
// Table: proposals
//   prevent_hard_delete_proposals: CREATE TRIGGER prevent_hard_delete_proposals BEFORE DELETE ON public.proposals FOR EACH ROW EXECUTE FUNCTION handle_logical_delete_proposal()
//   prevent_update_archived_proposal_trigger: CREATE TRIGGER prevent_update_archived_proposal_trigger BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION prevent_update_archived_proposal()
// Table: user_settings
//   trg_restrict_user_settings_update: CREATE TRIGGER trg_restrict_user_settings_update BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION restrict_user_settings_update()
// Table: vendedores
//   trg_restrict_vendedores_role_update: CREATE TRIGGER trg_restrict_vendedores_role_update BEFORE UPDATE ON public.vendedores FOR EACH ROW EXECUTE FUNCTION restrict_vendedores_role_update()

// --- INDEXES ---
// Table: draft_manuals
//   CREATE UNIQUE INDEX draft_manuals_user_id_key ON public.draft_manuals USING btree (user_id)
// Table: draft_proposals
//   CREATE UNIQUE INDEX draft_proposals_user_id_key ON public.draft_proposals USING btree (user_id)
// Table: email_tracking
//   CREATE UNIQUE INDEX email_tracking_token_key ON public.email_tracking USING btree (token)
// Table: historico_comunicacao
//   CREATE UNIQUE INDEX idx_historico_gmail_message_id ON public.historico_comunicacao USING btree (gmail_message_id) WHERE (gmail_message_id IS NOT NULL)
// Table: leads
//   CREATE INDEX idx_leads_email ON public.leads USING btree (email)
//   CREATE INDEX idx_leads_telefone ON public.leads USING btree (telefone)
//   CREATE INDEX idx_leads_visita_vendedor ON public.leads USING btree (visita_vendedor_id)
// Table: work_scales
//   CREATE UNIQUE INDEX work_scales_employee_id_period_key ON public.work_scales USING btree (employee_id, period)
