class CreateImageCrops < ActiveRecord::Migration
  def change
    create_table :image_crops do |t|
      t.belongs_to :image, foreign_key: true
      t.string :file

      t.timestamps null: false
    end
  end
end
