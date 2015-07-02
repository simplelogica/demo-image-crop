class CreatePages < ActiveRecord::Migration
  def change
    create_table :pages do |t|
      t.string :title
      t.belongs_to :header_crop, index: true, foreign_key: true
      t.belongs_to :sidebar_crop, index: true, foreign_key: true
      t.belongs_to :logo, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
