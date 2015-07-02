class PagesController < ApplicationController
  def new
    @page = Page.new
  end

  def create
    @page = Page.create! params.require(:page).permit(:title)
    redirect_to edit_page_path(@page)
  end

  def edit
    @page = Page.find(params[:id])
  end
end
