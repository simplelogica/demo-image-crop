require 'carrierwave/orm/activerecord'

class Image < ActiveRecord::Base
  mount_uploader :file, ImageUploader
  has_many :crops, class_name: "ImageCrop"
end
