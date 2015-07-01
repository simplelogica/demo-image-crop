class ImageCropsController < ApplicationController
  def new
    @image = Image.find params[:image_id]
    @crop = @image.crops.build
  end

  def create
    @image = Image.find params[:image_id]
    @crop = @image.crops.find params[:id]
  end
end
