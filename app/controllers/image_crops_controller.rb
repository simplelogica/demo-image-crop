class ImageCropsController < ApplicationController
  def new
    @image = Image.find params[:image_id]
    @crop = @image.crops.build
  end

  def create
    @image = Image.find params[:image_id]
    params.require(:image_crop).each do |crop|
      @image.crops.create! crop.permit(:file)
    end
    redirect_to @image
  end
end
