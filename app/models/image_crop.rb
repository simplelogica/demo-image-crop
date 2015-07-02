class ImageCrop < ActiveRecord::Base
  belongs_to :image
  mount_base64_uploader :file, CropUploader
end
