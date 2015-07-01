class ImagesController < ApplicationController
  def new
    @image = Image.new
  end

  def create
    @image = Image.create params.require(:image).permit(:file)
    redirect_to image_path(@image)
  end

  def show
    @image = Image.find params[:id]
  end
end
