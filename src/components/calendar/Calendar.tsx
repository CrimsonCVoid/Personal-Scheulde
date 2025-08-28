{/* Calendar Content */}
      <div className="flex-1 overflow-hidden w-full">
        {view === 'month' && <MonthView date={selectedDateObj} />}