class Page < ActiveRecord::Base
  belongs_to :header_crop, class_name: 'ImageCrop'
  belongs_to :sidebar_crop, class_name: 'ImageCrop'
  belongs_to :logo, class_name: 'ImageCrop'
end
